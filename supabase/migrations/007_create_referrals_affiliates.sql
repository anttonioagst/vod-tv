-- referrals
CREATE TABLE referrals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'active', 'expired')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);
CREATE INDEX referrals_referrer_id_idx ON referrals(referrer_id);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrals_own"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- affiliate_applications
CREATE TABLE affiliate_applications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_name TEXT NOT NULL,
  social_links TEXT[],
  message      TEXT,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE affiliate_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "affiliate_applications_select_own"
  ON affiliate_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "affiliate_applications_insert_own"
  ON affiliate_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
