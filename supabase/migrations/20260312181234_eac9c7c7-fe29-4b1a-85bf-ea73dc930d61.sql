
CREATE TABLE public.booking_inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  event_date text NOT NULL,
  event_time text,
  event_type text NOT NULL,
  venue text,
  city text,
  state text,
  guest_count text,
  music_genres text,
  special_requests text,
  budget text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_inquiries ENABLE ROW LEVEL SECURITY;

-- Public can insert booking inquiries (no auth required)
CREATE POLICY "Anyone can submit a booking inquiry"
  ON public.booking_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated admins could read (for now allow authenticated users to read all)
CREATE POLICY "Authenticated users can view booking inquiries"
  ON public.booking_inquiries
  FOR SELECT
  TO authenticated
  USING (true);
