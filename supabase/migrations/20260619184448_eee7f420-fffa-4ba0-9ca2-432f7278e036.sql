
CREATE TABLE public.franchises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.sellers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.campaign_info (
  id INTEGER PRIMARY KEY DEFAULT 1,
  prize TEXT NOT NULL DEFAULT 'Troféu Copa MRT 2026',
  CONSTRAINT single_row CHECK (id = 1)
);
INSERT INTO public.campaign_info (id, prize) VALUES (1, 'Troféu Copa MRT 2026');

GRANT SELECT ON public.franchises TO anon, authenticated;
GRANT SELECT ON public.sellers TO anon, authenticated;
GRANT SELECT ON public.campaign_info TO anon, authenticated;
GRANT ALL ON public.franchises TO service_role;
GRANT ALL ON public.sellers TO service_role;
GRANT ALL ON public.campaign_info TO service_role;

ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read franchises" ON public.franchises FOR SELECT USING (true);
CREATE POLICY "public read sellers" ON public.sellers FOR SELECT USING (true);
CREATE POLICY "public read campaign" ON public.campaign_info FOR SELECT USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.franchises;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sellers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_info;

INSERT INTO public.franchises (name, points) VALUES
  ('Ourinhos', 540), ('Marília', 510), ('Bauru', 470), ('Jaú', 410), ('Botucatu', 360);
INSERT INTO public.sellers (name, points) VALUES
  ('João Silva', 220), ('Carlos Souza', 210), ('Ana Lima', 190), ('Patrícia Reis', 170), ('Rafael Mendes', 150);
