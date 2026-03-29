CREATE TABLE videos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id       UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  thumbnail_url    TEXT,
  video_url        TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  is_exclusive     BOOLEAN DEFAULT FALSE,
  view_count       INTEGER DEFAULT 0,
  published_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX videos_channel_id_idx ON videos(channel_id);
CREATE INDEX videos_published_at_idx ON videos(published_at DESC);
CREATE INDEX videos_view_count_idx ON videos(view_count DESC);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "videos_select_public"
  ON videos FOR SELECT USING (true);

CREATE POLICY "videos_insert_own"
  ON videos FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM channels WHERE id = channel_id AND owner_id = auth.uid())
  );

CREATE POLICY "videos_update_own"
  ON videos FOR UPDATE USING (
    EXISTS (SELECT 1 FROM channels WHERE id = channel_id AND owner_id = auth.uid())
  );

CREATE POLICY "videos_delete_own"
  ON videos FOR DELETE USING (
    EXISTS (SELECT 1 FROM channels WHERE id = channel_id AND owner_id = auth.uid())
  );
