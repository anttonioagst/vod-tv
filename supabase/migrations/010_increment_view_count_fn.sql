CREATE OR REPLACE FUNCTION increment_view_count(vid uuid)
RETURNS void LANGUAGE sql AS $$
  UPDATE videos SET view_count = view_count + 1 WHERE id = vid;
$$;
