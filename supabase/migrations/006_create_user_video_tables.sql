-- video_views
CREATE TABLE video_views (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id   UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  watched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);
CREATE INDEX video_views_user_watched_idx ON video_views(user_id, watched_at DESC);

-- video_likes
CREATE TABLE video_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id   UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);
CREATE INDEX video_likes_user_id_idx ON video_likes(user_id);

-- watch_later
CREATE TABLE watch_later (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id   UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);
CREATE INDEX watch_later_user_id_idx ON watch_later(user_id);

ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_later ENABLE ROW LEVEL SECURITY;

CREATE POLICY "video_views_own" ON video_views USING (auth.uid() = user_id);
CREATE POLICY "video_likes_own" ON video_likes USING (auth.uid() = user_id);
CREATE POLICY "watch_later_own" ON watch_later USING (auth.uid() = user_id);
