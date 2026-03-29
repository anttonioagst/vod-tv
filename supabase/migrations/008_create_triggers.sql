-- Trigger 1: incrementar view_count em videos quando um video_view é inserido
CREATE OR REPLACE FUNCTION increment_video_view_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE videos SET view_count = view_count + 1 WHERE id = NEW.video_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_video_view_insert
  AFTER INSERT ON video_views
  FOR EACH ROW EXECUTE FUNCTION increment_video_view_count();

-- Trigger 2: manter video_count em channels
CREATE OR REPLACE FUNCTION update_channel_video_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE channels SET video_count = video_count + 1 WHERE id = NEW.channel_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE channels SET video_count = video_count - 1 WHERE id = OLD.channel_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_video_insert
  AFTER INSERT ON videos
  FOR EACH ROW EXECUTE FUNCTION update_channel_video_count();

CREATE TRIGGER on_video_delete
  AFTER DELETE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_channel_video_count();

-- Trigger 3: criar profile automaticamente após signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
