CREATE TABLE channels (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug         TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  username     TEXT UNIQUE NOT NULL,
  avatar_url   TEXT,
  banner_url   TEXT,
  description  TEXT,
  video_count  INTEGER DEFAULT 0,
  is_verified  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "channels_select_public"
  ON channels FOR SELECT USING (true);

CREATE POLICY "channels_insert_own"
  ON channels FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "channels_update_own"
  ON channels FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "channels_delete_own"
  ON channels FOR DELETE USING (auth.uid() = owner_id);
