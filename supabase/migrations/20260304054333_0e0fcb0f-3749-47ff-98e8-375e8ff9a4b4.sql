
-- Create DJ profiles table
CREATE TABLE public.dj_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  dj_name TEXT NOT NULL,
  genre TEXT,
  bio TEXT,
  profile_image_url TEXT,
  instagram_url TEXT,
  soundcloud_url TEXT,
  onboarding_complete BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create show clips table
CREATE TABLE public.show_clips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dj_id UUID NOT NULL REFERENCES public.dj_profiles(id) ON DELETE CASCADE,
  clip_text TEXT NOT NULL,
  clip_type TEXT DEFAULT 'intro',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dj_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.show_clips ENABLE ROW LEVEL SECURITY;

-- DJ profiles policies
CREATE POLICY "DJs can view their own profile"
ON public.dj_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "DJs can insert their own profile"
ON public.dj_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "DJs can update their own profile"
ON public.dj_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Public can view active DJ profiles"
ON public.dj_profiles FOR SELECT
USING (is_active = true AND onboarding_complete = true);

-- Show clips policies
CREATE POLICY "DJs can view their own clips"
ON public.show_clips FOR SELECT
USING (dj_id IN (SELECT id FROM public.dj_profiles WHERE user_id = auth.uid()));

CREATE POLICY "DJs can insert their own clips"
ON public.show_clips FOR INSERT
WITH CHECK (dj_id IN (SELECT id FROM public.dj_profiles WHERE user_id = auth.uid()));

-- Auto-create DJ profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_dj_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.dj_profiles (user_id, dj_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New DJ'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_dj
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_dj_signup();

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_dj_profiles_updated_at
  BEFORE UPDATE ON public.dj_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
