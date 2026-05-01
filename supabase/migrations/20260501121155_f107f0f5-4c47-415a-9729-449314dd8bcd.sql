
ALTER TABLE public.saved_leads
  ADD COLUMN IF NOT EXISTS buying_signal_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS buying_signal_status text NOT NULL DEFAULT 'Cold',
  ADD COLUMN IF NOT EXISTS buying_signal_reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS next_best_action text,
  ADD COLUMN IF NOT EXISTS last_signal_calculated_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_saved_leads_buying_signal_score
  ON public.saved_leads (buying_signal_score DESC);
