-- ============================================================
-- W-3.1 / W-3.2 / W-3.3  —  Brand Profiles, Auth, Wardrobe
-- Run this in Supabase SQL Editor (Dashboard → SQL → New Query)
-- ============================================================

-- ─── W-3.1: Brand Sustainability Profiles ────────────────────

CREATE TABLE IF NOT EXISTS brand_profiles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  logo_url    text,
  description text,

  -- Third-party scores (raw)
  good_on_you_rating   numeric(2,1),   -- 1.0 – 5.0
  bcorp_certified      boolean DEFAULT false,
  fti_score            numeric(5,2),   -- 0 – 100
  remake_score         numeric(5,2),   -- 0 – 100

  -- Aggregated normalized score (0.00 – 1.00)
  brand_score          numeric(4,3) NOT NULL DEFAULT 0.400,

  -- Human-readable ratings
  labor_rating         text CHECK (labor_rating IN ('Great','Good','It''s a Start','Not Good Enough','We Avoid')),
  environment_rating   text CHECK (environment_rating IN ('Great','Good','It''s a Start','Not Good Enough','We Avoid')),
  animal_rating        text CHECK (animal_rating IN ('Great','Good','It''s a Start','Not Good Enough','We Avoid')),

  certifications       text[] DEFAULT '{}',
  sustainability_summary text,

  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brand_profiles_public_read" ON brand_profiles FOR SELECT USING (true);

-- ─── W-3.2: User Saved Analyses (bookmarks / favorites) ─────

CREATE TABLE IF NOT EXISTS user_saved_analyses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id  text NOT NULL,
  query_text   text NOT NULL,
  trend_label  text,
  notes        text,
  saved_at     timestamptz DEFAULT now(),

  UNIQUE (user_id, analysis_id)
);

ALTER TABLE user_saved_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_saved" ON user_saved_analyses
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_saved_user ON user_saved_analyses (user_id, saved_at DESC);

-- ─── W-3.3: Wardrobe Items ──────────────────────────────────

CREATE TABLE IF NOT EXISTS wardrobe_items (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name         text NOT NULL,
  brand                text,
  category             text,
  price                numeric(10,2),
  currency             text DEFAULT 'USD',
  fiber_content        jsonb,
  sustainability_score integer,
  analysis_id          text,
  image_url            text,
  notes                text,
  purchased_at         date DEFAULT CURRENT_DATE,
  created_at           timestamptz DEFAULT now()
);

ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_wardrobe" ON wardrobe_items
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_wardrobe_user ON wardrobe_items (user_id, created_at DESC);

-- ─── W-3.3: Wear Logs ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS wear_logs (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id   uuid NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worn_at   date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wear_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_wear_logs" ON wear_logs
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_wear_item ON wear_logs (item_id, worn_at DESC);

-- ─── Seed brand_profiles with 8 major brands ────────────────

INSERT INTO brand_profiles (slug, name, good_on_you_rating, bcorp_certified, fti_score, remake_score, brand_score, labor_rating, environment_rating, animal_rating, certifications, sustainability_summary) VALUES
  ('zara',        'Zara',        2.0, false, 52.0, 44.0, 0.380,
   'Not Good Enough', 'It''s a Start', 'It''s a Start',
   ARRAY['SAC Higg Index'],
   'Zara has made some environmental commitments including its Join Life collection, but its fast-fashion model and lack of living-wage evidence keep its score low.'),

  ('h-and-m',     'H&M',         2.0, false, 56.0, 45.0, 0.400,
   'Not Good Enough', 'It''s a Start', 'Good',
   ARRAY['Better Cotton Initiative', 'SAC Higg Index'],
   'H&M publishes supplier lists and has a garment recycling program, but still produces at enormous volume with limited living-wage guarantees.'),

  ('patagonia',   'Patagonia',   4.5, true,  78.0, 80.0, 0.880,
   'Good', 'Great', 'Good',
   ARRAY['B Corp', 'Fair Trade Certified', '1% for the Planet', 'bluesign'],
   'Patagonia is an industry leader in environmental and social responsibility, using recycled materials extensively and donating 1% of sales to environmental causes.'),

  ('everlane',    'Everlane',    3.0, false, 34.0, 36.0, 0.520,
   'It''s a Start', 'It''s a Start', 'Good',
   ARRAY['Radical Transparency'],
   'Everlane emphasizes transparent pricing and ethical factories, but has faced criticism about labor claims and lacks third-party certifications.'),

  ('reformation', 'Reformation', 4.0, false, 26.0, 52.0, 0.680,
   'It''s a Start', 'Good', 'Good',
   ARRAY['Climate Neutral', 'OEKO-TEX'],
   'Reformation tracks its environmental footprint per garment and invests in sustainable fabrics, though its supply chain transparency could improve.'),

  ('shein',       'SHEIN',       1.0, false,  7.0,  5.0, 0.100,
   'We Avoid', 'We Avoid', 'We Avoid',
   ARRAY[]::text[],
   'SHEIN operates an ultra-fast-fashion model with near-zero transparency, numerous labor violation allegations, and heavy reliance on virgin polyester.'),

  ('uniqlo',      'Uniqlo',      2.5, false, 50.0, 40.0, 0.420,
   'Not Good Enough', 'It''s a Start', 'It''s a Start',
   ARRAY['Better Cotton Initiative'],
   'Uniqlo focuses on functional basics and has some material-sourcing initiatives, but transparency and labor-rights auditing remain weak spots.'),

  ('asos',        'ASOS',        2.5, false, 46.0, 30.0, 0.410,
   'Not Good Enough', 'It''s a Start', 'It''s a Start',
   ARRAY['Sustainable Cotton Challenge'],
   'ASOS has set sustainability targets and publishes a supplier list, but its marketplace model makes oversight difficult across thousands of products.')
ON CONFLICT (slug) DO NOTHING;
