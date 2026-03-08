export interface AlternativeProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  fiber_content: Record<string, number>;
  fiber_score: number;
  sustainability_grade: "A" | "B" | "C" | "D" | "F";
  sustainability_score: number | null;
  is_timeless: boolean;
  image_url: string | null;
  product_url: string;
  relevance_score: number;
  style_tags: string[];
}

export interface AlternativesResponse {
  alternatives: AlternativeProduct[];
  total: number;
}
