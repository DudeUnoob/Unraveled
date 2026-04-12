import selectorConfig from "../config/retailerSelectors.json";
import type { RetailerSelectorConfig } from "../types";

const KNOWN_CATEGORIES: Array<{ category: string; keywords: string[] }> = [
  { category: "tops", keywords: ["top", "shirt", "tee", "blouse", "tank", "polo", "henley", "camisole", "crop top", "tunic", "bodysuit"] },
  { category: "bottoms", keywords: ["jeans", "pants", "trouser", "skirt", "shorts", "chino", "jogger", "legging", "cargo", "culotte", "wide leg"] },
  { category: "dresses", keywords: ["dress", "gown", "romper", "jumpsuit", "playsuit"] },
  { category: "outerwear", keywords: ["jacket", "coat", "hoodie", "sweater", "cardigan", "blazer", "parka", "vest", "pullover", "sweatshirt", "anorak", "windbreaker", "trench"] },
  { category: "shoes", keywords: ["shoe", "sneaker", "boot", "loafer", "heel", "sandal", "mule", "flat", "oxford", "slipper", "clog", "espadrille"] },
  { category: "accessories", keywords: ["bag", "belt", "hat", "scarf", "glove", "wallet", "sunglasses", "jewelry", "watch", "tie"] }
];

const retailerEntries = Object.entries(
  selectorConfig as Record<string, RetailerSelectorConfig>
);

export const getRetailerConfigByHostname = (
  hostname: string
): { domain: string; config: RetailerSelectorConfig } | null => {
  const normalizedHost = hostname.toLowerCase();

  for (const [domain, config] of retailerEntries) {
    if (normalizedHost.endsWith(domain)) {
      return { domain, config };
    }
  }

  return null;
};

export const inferCategory = (source: string): string => {
  const normalized = source.toLowerCase();

  for (const entry of KNOWN_CATEGORIES) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry.category;
    }
  }

  return "apparel";
};

export const looksLikeProductPath = (
  pathname: string,
  patterns: string[]
): boolean => {
  const normalized = pathname.toLowerCase();
  return patterns.some((pattern) => normalized.includes(pattern.toLowerCase()));
};
