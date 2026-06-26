CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  api_key_hash TEXT NOT NULL,
  api_key_prefix TEXT NOT NULL,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teams_email ON teams(email);
CREATE INDEX idx_teams_api_key_hash ON teams(api_key_hash);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;