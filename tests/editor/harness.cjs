const { createHarness: createWorkspaceHarness } = require('../workspace/harness.cjs');

async function createHarness() {
  const harness = await createWorkspaceHarness();
  try {
    // Editor tests need draft history and audit columns in addition to the shared tenant fixtures.
    await harness.db.executeMultiple(`
      ALTER TABLE websites ADD COLUMN name TEXT;
      UPDATE websites SET name=slug;
      ALTER TABLE page_versions ADD COLUMN created_by TEXT;
      ALTER TABLE page_versions ADD COLUMN created_by_name TEXT;
      ALTER TABLE page_versions ADD COLUMN change_summary TEXT;
      ALTER TABLE page_versions ADD COLUMN created_at TEXT;
      ALTER TABLE page_versions ADD COLUMN approved_by TEXT;
      ALTER TABLE page_versions ADD COLUMN approved_by_name TEXT;
      ALTER TABLE page_versions ADD COLUMN approved_at TEXT;
      ALTER TABLE page_versions ADD COLUMN approved_content_hash TEXT;
      CREATE TABLE audit_log(id TEXT PRIMARY KEY,actor_id TEXT,actor_name TEXT,action TEXT,collection TEXT,record_id TEXT,result TEXT,details_json TEXT,created_at TEXT);
      CREATE TABLE media_assets(id TEXT PRIMARY KEY,client_id TEXT,url TEXT,filename TEXT,alt_text TEXT,mime_type TEXT,created_at TEXT);
    `);
    return harness;
  } catch (error) {
    harness.close();
    throw error;
  }
}

module.exports = { createHarness };
