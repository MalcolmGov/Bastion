/**
 * Bastion Move Studio: Database Backup & Restore Drill
 * Exports full relational database snapshot and performs an automated
 * dry-run restore into an isolated instance to verify disaster recovery.
 */

import { getDb, ensureDbReady } from '../src/lib/db/client';
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

export interface BackupSnapshot {
  timestamp: string;
  version: number;
  tableCounts: Record<string, number>;
  data: Record<string, any[]>;
}

export async function createDatabaseBackup(): Promise<BackupSnapshot> {
  await ensureDbReady();
  const db = getDb();
  const now = new Date().toISOString();

  // Find all user tables
  const tablesRes = await db.execute(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_libsql%'
    ORDER BY name ASC
  `);

  const tables = tablesRes.rows.map(r => String(r.name));
  const snapshotData: Record<string, any[]> = {};
  const tableCounts: Record<string, number> = {};

  for (const table of tables) {
    try {
      const rowsRes = await db.execute(`SELECT * FROM ${table}`);
      snapshotData[table] = rowsRes.rows;
      tableCounts[table] = rowsRes.rows.length;
    } catch (err: any) {
      console.warn(`[Backup] Warning reading table ${table}:`, err.message);
    }
  }

  return {
    timestamp: now,
    version: 1,
    tableCounts,
    data: snapshotData,
  };
}

export async function runRestoreDrill(snapshot: BackupSnapshot): Promise<{
  success: boolean;
  restoredTables: number;
  totalRecordsRestored: number;
  discrepancies: string[];
}> {
  const tempDbPath = path.join('/tmp', `bastion_drill_${Date.now()}.db`);
  const drillDb = createClient({ url: `file:${tempDbPath}` });
  const discrepancies: string[] = [];
  let totalRecords = 0;

  try {
    // 1. Replay baseline schema
    const schemaPath = path.join(process.cwd(), 'src/lib/db/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      const stmts = sql.split(';').map(s => s.trim()).filter(Boolean);
      for (const s of stmts) {
        try {
          await drillDb.execute(s);
        } catch (_) {}
      }
    }

    // 2. Replay versioned migrations and multi-tenant setup
    const { runMigrations } = await import('../src/lib/db/migrations');
    await runMigrations(drillDb);

    const { runMoveStudioMigrations } = await import('../src/lib/studio/seedMultiTenant');
    await runMoveStudioMigrations(drillDb);

    const { runPhase2Migrations } = await import('../src/lib/db/phase2Migrations');
    await runPhase2Migrations(drillDb);

    // Ensure results schema
    const { ensureResultsSchema } = await import('../src/lib/results/store');
    if (typeof ensureResultsSchema === 'function') {
      await ensureResultsSchema(drillDb);
    }

    // Disable foreign key constraints during bulk record restoration
    await drillDb.execute('PRAGMA foreign_keys = OFF;');

    // 3. Restore all records from snapshot
    for (const [table, rows] of Object.entries(snapshot.data)) {
      if (!rows || rows.length === 0) continue;

      // Clear any auto-seeded defaults in the drill instance so snapshot matches exactly
      try {
        await drillDb.execute(`DELETE FROM ${table}`);
      } catch (_) {}

      for (const row of rows) {
        const columns = Object.keys(row);
        const placeholders = columns.map(() => '?').join(', ');
        const values = columns.map(c => row[c]);

        try {
          await drillDb.execute({
            sql: `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
            args: values,
          });
          totalRecords++;
        } catch (err: any) {
          discrepancies.push(`Failed to restore row in ${table}: ${err.message}`);
        }
      }

      // Verify count in restored database
      try {
        const countRes = await drillDb.execute(`SELECT COUNT(*) as c FROM ${table}`);
        const restoredCount = Number(countRes.rows[0].c);
        if (restoredCount !== snapshot.tableCounts[table]) {
          discrepancies.push(
            `Count mismatch for ${table}: source had ${snapshot.tableCounts[table]}, restored has ${restoredCount}`
          );
        }
      } catch (err: any) {
        discrepancies.push(`Failed to count table ${table}: ${err.message}`);
      }
    }

    // Re-enable foreign key constraints
    await drillDb.execute('PRAGMA foreign_keys = ON;');

    return {
      success: discrepancies.length === 0,
      restoredTables: Object.keys(snapshot.data).length,
      totalRecordsRestored: totalRecords,
      discrepancies,
    };
  } finally {
    // Cleanup temporary drill file
    if (fs.existsSync(tempDbPath)) {
      try {
        fs.unlinkSync(tempDbPath);
      } catch (_) {}
    }
  }
}

async function main() {
  console.log('============================================================');
  console.log('🛡️  BASTION MOVE STUDIO: DISASTER RECOVERY & BACKUP DRILL');
  console.log('============================================================\n');

  console.log('1. Creating database snapshot...');
  const snapshot = await createDatabaseBackup();
  console.log(`✓ Snapshot captured at ${snapshot.timestamp}`);
  console.log(`✓ Tables captured: ${Object.keys(snapshot.tableCounts).length}`);
  for (const [t, c] of Object.entries(snapshot.tableCounts)) {
    if (c > 0) console.log(`   - ${t}: ${c} records`);
  }

  console.log('\n2. Executing automated restore drill on isolated instance...');
  const drillResult = await runRestoreDrill(snapshot);

  if (drillResult.success) {
    console.log(`\n✅ RESTORE DRILL PASSED: ${drillResult.restoredTables} tables and ${drillResult.totalRecordsRestored} records verified with 0 discrepancies.`);
  } else {
    console.error(`\n❌ RESTORE DRILL FAILED with ${drillResult.discrepancies.length} discrepancies:`);
    drillResult.discrepancies.forEach(d => console.error(`   - ${d}`));
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal drill error:', err);
    process.exit(1);
  });
}
