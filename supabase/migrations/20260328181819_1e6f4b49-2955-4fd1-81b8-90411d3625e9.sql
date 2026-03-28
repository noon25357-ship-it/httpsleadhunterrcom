
-- Fix permissive INSERT policy on contact_requests to be more specific
DROP POLICY IF EXISTS "Anyone can submit contact request" ON public.contact_requests;
CREATE POLICY "Anyone can submit contact request" ON public.contact_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Fix permissive SELECT on contact_requests - only admins
DROP POLICY IF EXISTS "Authenticated users can read requests" ON public.contact_requests;
CREATE POLICY "Admins can read requests" ON public.contact_requests
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
