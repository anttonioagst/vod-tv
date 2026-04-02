-- Fix: handle_new_user trigger failing with "Database error saving new user"
-- Cause: SECURITY DEFINER function without SET search_path = public
--        causes RLS to block the INSERT because auth.uid() is NULL during
--        OAuth signup (no session exists yet when auth.users row is created).
-- Fix:   SET search_path = public ensures the function runs with the correct
--        superuser privileges and bypasses RLS as postgres owner.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;
