-- Gold Fields Studio Database Schema
-- Compatible with SQLite / LibSQL and PostgreSQL

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL, -- platform_admin, content_editor, reviewer, publisher, analyst, website_operator, ai_knowledge_manager, read_only_stakeholder
  region_scope TEXT DEFAULT 'All',
  created_at TEXT NOT NULL,
  last_login TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS content_records (
  id TEXT PRIMARY KEY,
  collection TEXT NOT NULL, -- pages, operations, reports, sustainability_targets, news, jobs, suppliers, people, contacts, globals
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published', -- draft, in_review, approved, changes_requested, scheduled, published, archived
  current_published_revision_id TEXT,
  current_draft_revision_id TEXT,
  owner_id TEXT REFERENCES users(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_records_collection ON content_records(collection);
CREATE INDEX IF NOT EXISTS idx_records_slug ON content_records(slug);
CREATE INDEX IF NOT EXISTS idx_records_status ON content_records(status);

CREATE TABLE IF NOT EXISTS revisions (
  id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL REFERENCES content_records(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  data_json TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  author_id TEXT REFERENCES users(id),
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  review_comments TEXT
);

CREATE INDEX IF NOT EXISTS idx_revisions_record ON revisions(record_id);

CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  revision_id TEXT NOT NULL REFERENCES revisions(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL REFERENCES users(id),
  decision TEXT NOT NULL, -- approved, rejected
  comment TEXT,
  content_hash_at_approval TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id TEXT PRIMARY KEY,
  revision_id TEXT NOT NULL REFERENCES revisions(id) ON DELETE CASCADE,
  publish_at_utc TEXT NOT NULL,
  target_environment TEXT DEFAULT 'production',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, executed, cancelled, failed
  scheduled_by_id TEXT REFERENCES users(id),
  executed_at_utc TEXT,
  error_log TEXT
);

CREATE INDEX IF NOT EXISTS idx_jobs_status_publish ON scheduled_jobs(status, publish_at_utc);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  actor_name TEXT,
  action TEXT NOT NULL,
  collection TEXT,
  record_id TEXT,
  revision_id TEXT,
  result TEXT NOT NULL, -- success, denied
  details_json TEXT,
  correlation_id TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  focal_x REAL DEFAULT 0.5,
  focal_y REAL DEFAULT 0.5,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS asset_usages (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
  record_id TEXT NOT NULL REFERENCES content_records(id) ON DELETE CASCADE,
  field_path TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  severity TEXT NOT NULL, -- low, medium, high, critical
  status TEXT NOT NULL DEFAULT 'open', -- open, acknowledged, investigating, resolved
  affected_routes TEXT,
  owner_id TEXT REFERENCES users(id),
  timeline_json TEXT,
  created_at TEXT NOT NULL,
  resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS ai_knowledge_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  source_url TEXT NOT NULL,
  published_revision_id TEXT,
  status TEXT NOT NULL DEFAULT 'eligible', -- eligible, indexed, withdrawn, failed
  chunk_count INTEGER DEFAULT 0,
  last_indexed_at TEXT,
  eligibility_criteria TEXT
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  properties_json TEXT,
  timestamp TEXT NOT NULL,
  session_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_analytics_event_time ON analytics_events(event_name, timestamp);
