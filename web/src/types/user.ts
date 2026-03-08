export interface BrandProfile {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  good_on_you_rating: number | null;
  bcorp_certified: boolean;
  fti_score: number | null;
  remake_score: number | null;
  brand_score: number;
  labor_rating: RatingTier | null;
  environment_rating: RatingTier | null;
  animal_rating: RatingTier | null;
  certifications: string[];
  sustainability_summary: string | null;
  created_at: string;
  updated_at: string;
}

export type RatingTier =
  | "Great"
  | "Good"
  | "It's a Start"
  | "Not Good Enough"
  | "We Avoid";

export interface SavedAnalysis {
  id: string;
  user_id: string;
  analysis_id: string;
  query_text: string;
  trend_label: string | null;
  notes: string | null;
  saved_at: string;
}

export interface WardrobeItem {
  id: string;
  user_id: string;
  product_name: string;
  brand: string | null;
  category: string | null;
  price: number | null;
  currency: string;
  fiber_content: Record<string, number> | null;
  sustainability_score: number | null;
  analysis_id: string | null;
  image_url: string | null;
  notes: string | null;
  purchased_at: string;
  created_at: string;
  wear_count?: number;
}

export interface WearLog {
  id: string;
  item_id: string;
  user_id: string;
  worn_at: string;
  created_at: string;
}
