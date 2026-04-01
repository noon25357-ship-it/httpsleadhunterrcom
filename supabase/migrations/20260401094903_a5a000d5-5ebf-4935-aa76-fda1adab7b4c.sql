
-- Add status and tracking columns to saved_leads
ALTER TABLE public.saved_leads 
  ADD COLUMN status text NOT NULL DEFAULT 'new',
  ADD COLUMN last_action text,
  ADD COLUMN last_action_at timestamptz DEFAULT now(),
  ADD COLUMN contact_channel text,
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

-- Create index for efficient filtering
CREATE INDEX idx_saved_leads_user_status ON public.saved_leads(user_id, status);
