DROP POLICY IF EXISTS "Authenticated users can view booking inquiries" ON public.booking_inquiries;

DROP POLICY IF EXISTS "Anyone can submit a booking inquiry" ON public.booking_inquiries;

CREATE POLICY "Public can submit valid booking inquiry"
ON public.booking_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(full_name)) > 0
  AND length(trim(email)) > 3
  AND position('@' in email) > 1
  AND length(trim(event_type)) > 0
  AND length(trim(event_date)) > 0
);