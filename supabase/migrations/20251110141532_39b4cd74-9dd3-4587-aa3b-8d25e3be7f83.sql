-- Create table for storing operational processes and knowledge base
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create policies for knowledge base
CREATE POLICY "Anyone can view knowledge base" 
ON public.knowledge_base 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create knowledge base entries" 
ON public.knowledge_base 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update knowledge base entries" 
ON public.knowledge_base 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete knowledge base entries" 
ON public.knowledge_base 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_knowledge_base_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_knowledge_base_updated_at
BEFORE UPDATE ON public.knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.update_knowledge_base_updated_at();

-- Add process_id to conversations table
ALTER TABLE public.conversations 
ADD COLUMN process_id UUID REFERENCES public.knowledge_base(id);