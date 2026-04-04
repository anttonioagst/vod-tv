CREATE TABLE creator_channels (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id        UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  platform          TEXT NOT NULL DEFAULT 'twitch',
  platform_user_id  TEXT NOT NULL,
  platform_username TEXT NOT NULL,
  twitch_webhook_id TEXT,
  auto_record       BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX creator_channels_channel_id_idx ON creator_channels(channel_id);
CREATE INDEX creator_channels_platform_user_id_idx ON creator_channels(platform_user_id);

ALTER TABLE creator_channels ENABLE ROW LEVEL SECURITY;

-- Apenas service role lê/escreve (worker + admin)
CREATE POLICY "creator_channels_service_only"
  ON creator_channels FOR ALL
  USING (auth.role() = 'service_role');
