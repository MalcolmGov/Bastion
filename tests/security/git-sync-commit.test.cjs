const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createHarness } = require('./harness.cjs');

// pushSchemaToGit writes into process.cwd() and commits there, so run it inside a throwaway repository.
function tempRepo(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bastion-git-sync-'));
  const previousCwd = process.cwd();
  const previousEnv = { ...process.env };
  Object.assign(process.env, {
    GIT_CONFIG_GLOBAL: os.devNull, GIT_CONFIG_SYSTEM: os.devNull,
    GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.com',
    GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 'test@example.com',
  });
  execFileSync('git', ['init', '-q', dir]);
  process.chdir(dir);
  t.after(() => {
    process.chdir(previousCwd);
    process.env = previousEnv;
    fs.rmSync(dir, { recursive: true, force: true });
  });
  return dir;
}

test('git schema push treats the commit message as data, never as shell syntax', async t => {
  const h = await createHarness();
  t.after(() => h.close());
  const { pushSchemaToGit } = h.load('lib/schema/gitSync.ts');
  const dir = tempRepo(t);

  const markers = ['quote', 'subshell', 'backtick', 'semicolon'].map(name => path.join(dir, `injected-${name}`));
  const messages = [
    `x"; touch "${markers[0]}"; echo "`,
    `$(touch "${markers[1]}")`,
    '`touch ' + markers[2] + '`',
    `fix; touch ${markers[3]} #`,
  ];

  for (const message of messages) {
    const result = await pushSchemaToGit(message);
    assert.equal(result.success, true);
    const recorded = execFileSync('git', ['log', '-1', '--format=%B'], { cwd: dir, encoding: 'utf8' }).trim();
    assert.equal(recorded, message, 'the commit message must be recorded literally');
  }
  for (const marker of markers) {
    assert.equal(fs.existsSync(marker), false, `shell command ran: ${path.basename(marker)}`);
  }
});

test('git schema push still commits the schema files with the default message', async t => {
  const h = await createHarness();
  t.after(() => h.close());
  const { pushSchemaToGit } = h.load('lib/schema/gitSync.ts');
  const dir = tempRepo(t);

  const result = await pushSchemaToGit();
  assert.equal(result.success, true);
  assert.match(result.commitSha, /^[0-9a-f]{7,}$/);
  const files = execFileSync('git', ['show', '--name-only', '--format=', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim().split('\n').sort();
  assert.deepEqual(files, ['bastion-schema.json', 'bastion.config.ts', 'types/bastion-cms.d.ts']);
  const subject = execFileSync('git', ['log', '-1', '--format=%s'], { cwd: dir, encoding: 'utf8' }).trim();
  assert.match(subject, /^chore\(schema\): sync Bastion CMS schema definitions/);
});
