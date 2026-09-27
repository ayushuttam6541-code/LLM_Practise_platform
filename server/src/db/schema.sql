-- LLD Practice Platform SQLite Schema

CREATE TABLE IF NOT EXISTS problems (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK(difficulty IN ('Easy', 'Medium', 'Hard')),
  practice_focus TEXT NOT NULL,
  requirements TEXT NOT NULL,       -- JSON array of strings
  constraints_text TEXT NOT NULL,   -- JSON array of strings
  example_scenarios TEXT NOT NULL,  -- JSON array of strings
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY,
  problem_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('IN_PROGRESS', 'SUBMITTED', 'EVALUATING', 'COMPLETED', 'FAILED')),
  created_at TEXT NOT NULL,
  submitted_at TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  attempt_id TEXT UNIQUE NOT NULL,
  requirements TEXT NOT NULL DEFAULT '',
  assumptions TEXT NOT NULL DEFAULT '',
  classes TEXT NOT NULL DEFAULT '',
  relationships TEXT NOT NULL DEFAULT '',
  reasoning TEXT NOT NULL DEFAULT '',
  extensibility TEXT NOT NULL DEFAULT '',
  edge_cases TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evaluations (
  id TEXT PRIMARY KEY,
  attempt_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('COMPLETED', 'FAILED')),
  overall_summary TEXT NOT NULL,
  overall_score REAL NOT NULL,
  what_went_well TEXT NOT NULL,      -- JSON array of strings
  what_to_improve TEXT NOT NULL,     -- JSON array of strings
  suggested_next_step TEXT NOT NULL,
  evaluator_used TEXT NOT NULL,
  error_message TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback_items (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL,
  criterion TEXT NOT NULL,
  score REAL NOT NULL,
  evidence TEXT NOT NULL,
  concern TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK(confidence IN ('high', 'medium', 'low')),
  sort_order INTEGER NOT NULL,
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_attempts_problem_id ON attempts(problem_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON attempts(status);
CREATE INDEX IF NOT EXISTS idx_feedback_eval_id ON feedback_items(evaluation_id);
