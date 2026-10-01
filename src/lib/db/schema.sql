-- Gold Fields Studio Database Schema
-- Compatible with SQLite / LibSQL and PostgreSQL

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL, -- platform_admin, content_editor, reviewer, publisher, analyst, website_operator, ai_knowledge_manager, read_only_stakeholder
  region_scope TEXT DEFAULT 'All',
  client_id TEXT,
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
  resolved_at TEXT,
  error_details TEXT,
  ai_diagnosis TEXT,
  ai_proposed_patch TEXT,
  risk_level TEXT DEFAULT 'low',
  pr_number INTEGER,
  pr_url TEXT,
  pr_branch TEXT,
  pr_status TEXT DEFAULT 'none',
  approval_status TEXT DEFAULT 'pending_review',
  approved_by TEXT,
  deploy_status TEXT DEFAULT 'idle',
  verification_status TEXT DEFAULT 'unverified',
  repo_owner TEXT DEFAULT 'MalcolmGov',
  repo_name TEXT DEFAULT 'MoveDigital'
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

-- ============================================================================
-- MOVE STUDIO MULTI-TENANT PLATFORM TABLES
-- Hierarchy: Agency Workspace -> Client -> Website -> Environment
-- ============================================================================

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT NOT NULL,
  logo_url TEXT,
  primary_contact_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS websites (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  blueprint_id TEXT NOT NULL, -- corporate, professional_services, hospitality
  design_collection_id TEXT NOT NULL, -- editorial, contemporary, immersive
  status TEXT NOT NULL DEFAULT 'draft', -- draft, in_review, approved, published
  primary_domain TEXT,
  published_revision_id TEXT,
  current_draft_revision_id TEXT,
  settings_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_websites_client ON websites(client_id);
CREATE INDEX IF NOT EXISTS idx_websites_slug ON websites(slug);

CREATE TABLE IF NOT EXISTS brand_kits (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'approved', -- observed, inferred, approved, needs_review
  logos_json TEXT NOT NULL,
  colors_json TEXT NOT NULL,
  typography_json TEXT NOT NULL,
  component_rules_json TEXT NOT NULL,
  voice_and_messaging_json TEXT NOT NULL,
  locked_attributes_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_brand_kits_site ON brand_kits(site_id);

CREATE TABLE IF NOT EXISTS page_compositions (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  page_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  layout_collection TEXT NOT NULL,
  sections_json TEXT NOT NULL,
  meta_json TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_compositions_site_page ON page_compositions(site_id, page_slug);

CREATE TABLE IF NOT EXISTS website_imports (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  site_id TEXT REFERENCES websites(id),
  source_url TEXT NOT NULL,
  status TEXT NOT NULL, -- pending, in_progress, completed, failed
  step TEXT NOT NULL, -- setup, scope, extract, review, design, assemble, refine
  scope_config_json TEXT NOT NULL,
  discovered_pages_json TEXT NOT NULL,
  extracted_data_json TEXT NOT NULL,
  review_state_json TEXT NOT NULL,
  error_log TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_imports_client ON website_imports(client_id);

CREATE TABLE IF NOT EXISTS site_releases (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  version_label TEXT NOT NULL,
  composition_snapshot_json TEXT NOT NULL,
  brand_kit_snapshot_json TEXT NOT NULL,
  published_by TEXT NOT NULL,
  published_at TEXT NOT NULL,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_releases_site ON site_releases(site_id);

CREATE TABLE IF NOT EXISTS billing_docs (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  site_id TEXT REFERENCES websites(id),
  type TEXT NOT NULL, -- quote, invoice, receipt, credit-note
  status TEXT NOT NULL, -- draft, sent, accepted, declined, paid, overdue, cancelled, expired
  doc_number TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'R',
  items_json TEXT NOT NULL,
  notes TEXT,
  bank_name TEXT,
  account_no TEXT,
  branch_code TEXT,
  payment_ref TEXT,
  company_name TEXT,
  company_address TEXT,
  company_email TEXT,
  company_phone TEXT,
  company_vat TEXT,
  company_reg_no TEXT,
  client_address TEXT,
  client_email TEXT,
  client_phone TEXT,
  client_vat TEXT,
  client_contact_person TEXT,
  payment_terms TEXT,
  swift_code TEXT,
  sent_at TEXT,
  last_reminded_at TEXT,
  reminders_count INTEGER DEFAULT 0,
  paid_at TEXT,
  amount_paid REAL,
  acceptance_token TEXT UNIQUE,
  signature_data TEXT,
  signer_name TEXT,
  signer_role TEXT,
  accepted_at TEXT,
  declined_at TEXT,
  decline_reason TEXT,
  converted_from_quote_id TEXT,
  converted_to_invoice_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_billing_docs_client ON billing_docs(client_id);
CREATE INDEX IF NOT EXISTS idx_billing_docs_token ON billing_docs(acceptance_token);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  target_url TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  latency_ms INTEGER,
  status TEXT NOT NULL, -- success, failed
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_site ON webhook_deliveries(site_id, created_at);

