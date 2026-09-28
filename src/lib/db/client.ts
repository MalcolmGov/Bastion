import { createClient, Client, InStatement } from '@libsql/client';
import fs from 'fs';
import path from 'path';

// Singleton database client for Gold Fields Studio
let client: Client | null = null;

export function getDb(): Client {
  if (!client) {
    const url = process.env.DATABASE_URL || 'file:studio.db';
    client = createClient({ url });
  }
  return client;
}

// Initialize tables if they do not exist
export async function initDb(): Promise<void> {
  const db = getDb();
  const schemaPath = path.join(process.cwd(), 'src/lib/db/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  // Split by statements and execute
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    await db.execute(statement);
  }
}
