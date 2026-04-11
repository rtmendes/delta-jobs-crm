-- Delta Jobs CRM schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS delta_jobs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  url          TEXT NOT NULL,
  company      TEXT NOT NULL DEFAULT 'Delta Air Lines',
  location     TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'new'
               CHECK (status IN ('new','applied','phone_screen','interview','offer','rejected','archived')),
  score        INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  reasoning    TEXT NOT NULL DEFAULT '',
  jd_text      TEXT NOT NULL DEFAULT '',
  notes        TEXT NOT NULL DEFAULT '',
  source_query TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS delta_jobs_status_idx    ON delta_jobs(status);
CREATE INDEX IF NOT EXISTS delta_jobs_score_idx     ON delta_jobs(score DESC);
CREATE INDEX IF NOT EXISTS delta_jobs_created_idx   ON delta_jobs(created_at DESC);

-- Row Level Security
ALTER TABLE delta_jobs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY IF NOT EXISTS "service_role_all"
  ON delta_jobs FOR ALL
  USING (true)
  WITH CHECK (true);
