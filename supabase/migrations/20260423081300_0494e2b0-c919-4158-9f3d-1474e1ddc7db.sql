ALTER TABLE public.dj_profiles
  ADD CONSTRAINT chk_instagram_url
    CHECK (
      instagram_url IS NULL
      OR instagram_url = ''
      OR instagram_url ~* '^https://(www\.)?instagram\.com(/.*)?$'
    ),
  ADD CONSTRAINT chk_soundcloud_url
    CHECK (
      soundcloud_url IS NULL
      OR soundcloud_url = ''
      OR soundcloud_url ~* '^https://(www\.)?soundcloud\.com(/.*)?$'
    );