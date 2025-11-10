-- Create table to store conversation sessions
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario TEXT NOT NULL,
  customer_profile TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  csat_score INTEGER,
  feedback TEXT,
  transcript JSONB DEFAULT '[]'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for now since we don't have auth yet)
CREATE POLICY "Anyone can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view conversations"
ON public.conversations
FOR SELECT
USING (true);

CREATE POLICY "Anyone can update conversations"
ON public.conversations
FOR UPDATE
USING (true);