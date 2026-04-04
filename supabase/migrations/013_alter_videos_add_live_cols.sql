ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS source          TEXT NOT NULL DEFAULT 'upload',
  ADD COLUMN IF NOT EXISTS live_session_id UUID REFERENCES live_sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS hls_url         TEXT,
  ADD COLUMN IF NOT EXISTS mp4_url         TEXT;

CREATE INDEX videos_live_session_id_idx ON videos(live_session_id);
CREATE INDEX videos_source_idx ON videos(source);

-- Constraint: source deve ser 'upload' ou 'live_recording'
ALTER TABLE videos
  ADD CONSTRAINT videos_source_check
  CHECK (source IN ('upload', 'live_recording'));
