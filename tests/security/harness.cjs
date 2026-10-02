const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const ts = require(path.join(root,'node_modules/typescript'));
const nativeRequire = require('node:module').createRequire(path.join(root,'package.json'));
const { createClient } = nativeRequire('@libsql/client');
const { NextRequest } = nativeRequire('next/server');

async function createHarness() {
  // Authentication and outbound delivery are mocked; route handlers, guards,
  // token validation, SQL queries and transactions execute their real code.
  const db = createClient({ url: 'file::memory:' });
  let emailCalls = 0;
  let currentUser = {
    id: 'reader-a', name: 'Reader A', email: 'reader-a@test.local',
    role: 'read_only_stakeholder', client_id: 'tenant-a'
  };
  const cache = new Map();
  const mocks = {
    '@/lib/db/client': { getDb: () => db, ensureDbReady: async () => db },
    '@/lib/email/delivery': {
      sendTransactionalEmail: async () => {
        emailCalls++;
        return { ok: true, status: 'simulated_dev' };
      }
    },
    '@/lib/notifications/notifier': { sendReviewNotification: async () => {} },
    '@/lib/webhooks/dispatcher': { dispatchContentWebhook: async () => {} },
    'next/cache': { revalidatePath: () => {} }
  };
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} };
    cache.set(file, mod);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
        esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX
      }
    }).outputText;
    const req = (id) => {
      if (mocks[id]) return mocks[id];
      if (id.startsWith('@/')) return load(path.join(root, 'src', id.slice(2)) + '.ts');
      if (id.startsWith('.')) return load(path.resolve(path.dirname(file), id) + '.ts');
      return nativeRequire(id);
    };
    const wrapper = `(function(require,module,exports,__filename,__dirname){${source}\n})`;
    // NOSONAR: Test harness isolated execution
    vm.runInThisContext(wrapper, { filename: file })(req, mod, mod.exports, file, path.dirname(file)); // NOSONAR
    return mod.exports;
  }
  const auth = load(path.join(root, 'src/lib/auth/auth.ts'));
  mocks['@/lib/auth/auth'] = { ...auth, getCurrentUser: async () => currentUser };
  const route = (name) => load(path.join(root, 'src/app', name, 'route.ts'));
  const request = (url, body, token, method = 'POST') => new NextRequest('http://localhost' + url, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) },
    ...(method === 'GET' ? {} : { body: JSON.stringify(body) })
  });
  await db.executeMultiple(`
 CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT,email TEXT,role TEXT,client_id TEXT,password_hash TEXT,region_scope TEXT,invite_token TEXT,invite_token_expires_at TEXT,must_reset_password INTEGER,created_at TEXT);
 CREATE TABLE api_tokens(id TEXT PRIMARY KEY,name TEXT,token_hash TEXT,client_id TEXT,site_id TEXT,scopes_json TEXT,created_at TEXT,revoked_at TEXT);
 CREATE TABLE clients(id TEXT PRIMARY KEY,name TEXT,slug TEXT);
 CREATE TABLE websites(id TEXT PRIMARY KEY,client_id TEXT,slug TEXT,primary_domain TEXT,status TEXT);
 CREATE TABLE page_compositions(id TEXT PRIMARY KEY,site_id TEXT,page_slug TEXT,title TEXT,layout_collection TEXT,sections_json TEXT,meta_json TEXT,version INTEGER,status TEXT,created_at TEXT,updated_at TEXT);
 CREATE TABLE content_records(id TEXT PRIMARY KEY,collection TEXT,slug TEXT,title TEXT,status TEXT,current_published_revision_id TEXT,current_draft_revision_id TEXT,site_id TEXT,client_id TEXT,created_at TEXT,updated_at TEXT);
 CREATE TABLE revisions(id TEXT PRIMARY KEY,record_id TEXT REFERENCES content_records(id),revision_number INTEGER,data_json TEXT,content_hash TEXT,author_id TEXT REFERENCES users(id),created_at TEXT,status TEXT,review_comments TEXT);
 CREATE TABLE content_releases(id TEXT PRIMARY KEY,client_id TEXT,site_id TEXT,name TEXT,description TEXT,status TEXT,scheduled_at TEXT,published_at TEXT,published_by TEXT,item_count INTEGER,created_at TEXT,updated_at TEXT);
 CREATE TABLE content_release_items(id TEXT PRIMARY KEY,release_id TEXT,item_type TEXT,item_id TEXT,title TEXT,action TEXT,changes_summary TEXT,snapshot_json TEXT,created_at TEXT);
 CREATE TABLE audit_log(id TEXT PRIMARY KEY,actor_id TEXT,actor_name TEXT,action TEXT,collection TEXT,record_id TEXT,result TEXT,details_json TEXT,created_at TEXT);
 CREATE TABLE whistleblower_reports(id TEXT PRIMARY KEY,client_id TEXT,status TEXT,resolution_summary TEXT,assigned_investigator_id TEXT,updated_at TEXT,tracking_code TEXT,category TEXT,severity TEXT,jurisdiction TEXT,subject TEXT,encrypted_details TEXT,created_at TEXT);
 CREATE TABLE whistleblower_messages(id TEXT PRIMARY KEY,report_id TEXT,sender_type TEXT,sender_id TEXT,encrypted_message TEXT,created_at TEXT);
 CREATE TABLE approvals(id TEXT PRIMARY KEY,revision_id TEXT,reviewer_id TEXT,decision TEXT,content_hash_at_approval TEXT);
 CREATE TABLE media_assets(id TEXT PRIMARY KEY,client_id TEXT,site_id TEXT,filename TEXT,url TEXT,mime_type TEXT,size_bytes INTEGER,folder_id TEXT,hotspot_data_json TEXT);
 INSERT INTO clients VALUES('tenant-a','A','a'),('tenant-b','B','b');
 INSERT INTO websites VALUES('site-a','tenant-a','a','a.example','published'),('site-a2','tenant-a','a2','a2.example','published'),('site-b','tenant-b','b','b.example','published');
 INSERT INTO users(id,name,email,role,client_id) VALUES
   ('victim-b','Victim B','victim-b@test.local','reviewer','tenant-b'),
   ('reader-a','Reader A','reader-a@test.local','read_only_stakeholder','tenant-a'),
   ('author-a','Author A','author-a@test.local','content_editor','tenant-a'),
   ('reviewer-a','Reviewer A','reviewer-a@test.local','reviewer','tenant-a');
 INSERT INTO content_records VALUES('record-b','reports','secret-report','Secret B','draft',NULL,'revision-b','site-b','tenant-b','2026-10-01','2026-10-01');
 INSERT INTO revisions VALUES('revision-b','record-b',1,'{"secret":"unpublished B"}','hash','victim-b','2026-10-01','draft',NULL);
 INSERT INTO page_compositions VALUES('page-a','site-a','home','A Home','contemporary','[]',NULL,1,'draft','2026-10-01','2026-10-01');
 INSERT INTO page_compositions VALUES('page-b','site-b','home','B Home','contemporary','[]',NULL,1,'draft','2026-10-01','2026-10-01');
 INSERT INTO whistleblower_reports(id,client_id,status,updated_at,encrypted_details) VALUES('case-a','tenant-a','received','2026-10-01','{"details":"A confidential"}'),('case-b','tenant-b','received','2026-10-01','{"details":"B confidential"}');
 INSERT INTO media_assets VALUES('media-a','tenant-a','site-a','a.png','/a.png','image/png',1,'corporate',NULL),('media-b','tenant-b','site-b','b.png','/b.png','image/png',1,'corporate',NULL),('media-a2','tenant-a','site-a2','a2.png','/a2.png','image/png',1,'corporate',NULL);
 INSERT INTO page_compositions VALUES('page-a2','site-a2','home','A2 Home','contemporary','[]',NULL,1,'draft','2026-10-01','2026-10-01');
 INSERT INTO content_records VALUES('record-a','reports','own-report','Own A','draft',NULL,'revision-a','site-a','tenant-a','2026-10-01','2026-10-01'),('record-a2','reports','own-report2','Own A2','draft',NULL,'revision-a2','site-a2','tenant-a','2026-10-01','2026-10-01');
 INSERT INTO revisions VALUES('revision-a','record-a',1,'{"secret":"unpublished A"}','hash','author-a','2026-10-01','draft',NULL),('revision-a2','record-a2',1,'{}','hash','author-a','2026-10-01','draft',NULL);
 `);

  return {
    db, load: (name) => load(path.join(root, 'src', name)), route, request,
    user: (user) => { currentUser = user ? { ...currentUser, ...user } : null; },
    emailCalls: () => emailCalls,
    token: async (scopes = ['mcp:access', 'content:read', 'graphql:read'], siteId = null) =>
      (await load(path.join(root, 'src/lib/auth/apiToken.ts')).createApiToken({
        name: 'Test', clientId: 'tenant-a', siteId: siteId || undefined, scopes
      })).rawToken,
    close: () => db.close()
  };
}
module.exports = { createHarness };
