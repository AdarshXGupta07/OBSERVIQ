-- Traces table
-- Har ek AI call ka record yahan store hoga
CREATE TABLE traces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Kaun si company ka trace hai
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  -- AI call ki details
  model TEXT NOT NULL,
  input TEXT,
  output TEXT,

  -- Performance metrics
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,

  -- Cost
  cost_usd DECIMAL(10, 6) DEFAULT 0.000000,

  -- Status
  status TEXT DEFAULT 'success',
  error_message TEXT,

  -- Extra info
  feature_name TEXT,
  user_identifier TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes — fast queries ke liye
-- team_id pe index: "Doctor App ke saare traces do" fast hoga
CREATE INDEX idx_traces_team_id ON traces(team_id);

-- created_at pe index: "Aaj ke traces do" fast hoga
CREATE INDEX idx_traces_created_at ON traces(created_at);

-- team_id + created_at combined: sabse common query fast hogi
CREATE INDEX idx_traces_team_created ON traces(team_id, created_at DESC);

-- RLS enable karo
ALTER TABLE traces ENABLE ROW LEVEL SECURITY;