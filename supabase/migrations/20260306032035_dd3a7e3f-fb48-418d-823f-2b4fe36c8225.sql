CREATE OR REPLACE FUNCTION public.handle_new_dj_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.dj_profiles (user_id, dj_name)
  VALUES (NEW.id, LEFT(COALESCE(NEW.raw_user_meta_data->>'full_name', 'New DJ'), 100));
  RETURN NEW;
END;
$$;