// Shared set-up for the tests that sign people in, create them or set their passwords.

// What the sign-in routes read and the shared harness schema leaves out.
const AUTH_SCHEMA = [
  'ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0',
  'ALTER TABLE users ADD COLUMN locked_until TEXT',
  'ALTER TABLE users ADD COLUMN last_login TEXT',
  'ALTER TABLE audit_log ADD COLUMN correlation_id TEXT',
  'ALTER TABLE audit_log ADD COLUMN ip_address TEXT',
  'CREATE TABLE sessions(id TEXT PRIMARY KEY, user_id TEXT, token_hash TEXT, expires_at TEXT, ip_address TEXT, user_agent TEXT)',
];

function addAuthSchema(db) {
  return db.batch(AUTH_SCHEMA);
}

/**
 * For one test: removes the variables in `clear`, sets the ones in `set`, and silences the warnings and errors the code
 * under test prints on purpose. All of it is put back when the test ends.
 */
function isolateEnvironment(t, { clear = [], set = {} } = {}) {
  const saved = {};
  for (const key of [...clear, ...Object.keys(set)]) saved[key] = process.env[key];
  for (const key of clear) delete process.env[key];
  Object.assign(process.env, set);
  const { warn, error } = console;
  console.warn = () => {};
  console.error = () => {};
  t.after(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    console.warn = warn;
    console.error = error;
  });
}

module.exports = { addAuthSchema, isolateEnvironment };
