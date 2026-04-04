CREATE TABLE live_sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id     UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  platform       TEXT NOT NULL DEFAULT 'twitch',
  stream_title   TEXT,
  started_at     TIMESTAMPTZ,
  ended_at       TIMESTAMPTZ,
  status         TEXT NOT NULL DEFAULT 'recording',
  -- status: 'recording' | 'processing' | 'completed' | 'failed'
  recording_path TEXT,
  hls_url        TEXT,
  video_id       UUID REFERENCES videos(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX live_sessions_channel_id_idx ON live_sessions(channel_id);
CREATE INDEX live_sessions_status_idx ON live_sessions(status);

ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;

-- Leitura pública (para exibir lives ativas no frontend)
CREATE POLICY "live_sessions_select_public"
  ON live_sessions FOR SELECT USING (true);

-- Escrita apenas service role (worker)
CREATE POLICY "live_sessions_write_service"
  ON live_sessions FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "live_sessions_update_service"
  ON live_sessions FOR UPDATE USING (auth.role() = 'service_role');
