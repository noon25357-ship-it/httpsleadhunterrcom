CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.intent_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  author TEXT,
  title TEXT,
  content TEXT NOT NULL,
  subreddit TEXT,
  intent_score INTEGER NOT NULL DEFAULT 0,
  intent_category TEXT NOT NULL DEFAULT 'other',
  ai_summary TEXT,
  suggested_reply TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, source_url)
);

ALTER TABLE public.intent_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own intent leads"
ON public.intent_leads FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intent leads"
ON public.intent_leads FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own intent leads"
ON public.intent_leads FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own intent leads"
ON public.intent_leads FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_intent_leads_updated_at
BEFORE UPDATE ON public.intent_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.intent_leads;