import { gatherText, firstImageSrc, firstNonEmptyText, inferCurrency, parsePrice } from "./dom";
import { normalizeFiberComposition, parseFiberComposition } from "./fiberParser";
import { getRetailerConfigByHostname, inferCategory, looksLikeProductPath } from "./url";
import type { ProductContext } from "../types";

/**
 * Keep a high-recall material excerpt for server-side LLM parsing.
 * We intentionally avoid strict keyword-only filtering so we don't drop
 * uncommon fiber names and retailer-specific composition phrasing.
 */
const gatherFiberText = (materialText: string, descriptionText: string): string => {
  const materialSignalPattern =
    /%|material|composition|fabric|made of|contains|shell|lining|body|trim|outer|inner|recycled|organic|cotton|linen|polyester|wool|rayon|viscose|nylon|spandex|acrylic|hemp|lyocell|tencel|silk|modal|cashmere|elastane|pfas|formaldehyde/i;

  const materialLines = materialText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 1);

  const descriptionLines = descriptionText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 1 && materialSignalPattern.test(line));

  return [...materialLines, ...descriptionLines].join("\n");
};

const MAX_MATERIAL_EXCERPT_CHARS = 12_000;

const GENERIC_FIBER_SELECTORS = [
  "details, summary",
  "[id*='material']",
  "[id*='fabric']",
  "[id*='composition']",
  "[class*='material']",
  "[class*='fabric']",
  "[class*='composition']",
  "[data-testid*='material']",
  "[data-testid*='fabric']",
  "[data-testid*='composition']",
  "[itemprop='material']",
];

const dedupeLines = (value: string): string => {
  const seen = new Set<string>();
  const lines: string[] = [];

  for (const rawLine of value.split(/\n+/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }
    const normalized = line.toLowerCase();
    if (seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    lines.push(line);
  }

  return lines.join("\n");
};

const truncateForModelInput = (value: string, maxChars = MAX_MATERIAL_EXCERPT_CHARS): string => {
  if (value.length <= maxChars) {
    return value;
  }

  return value.slice(0, maxChars);
};

/* ------------------------------------------------------------------ */
/*  JSON-LD extraction — the most reliable source of product data     */
/* ------------------------------------------------------------------ */

interface JsonLdProduct {
  name?: string;
  brand?: string | { name?: string };
  description?: string;
  material?: string;
  image?: string | string[] | { url?: string };
  offers?: {
    price?: number | string;
    priceCurrency?: string;
  } | Array<{
    price?: number | string;
    priceCurrency?: string;
  }>;
  additionalProperty?: Array<{
    name?: string;
    value?: string;
  }>;
  category?: string;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Extract product data from JSON-LD `<script type="application/ld+json">` tags.
 *
 * Retailers like Zara, H&M, ASOS, Nordstrom, and Target embed structured
 * product data in JSON-LD. This is far more reliable than CSS selectors
 * because it's machine-readable and consistent across redesigns.
 */
const extractJsonLdProduct = (): JsonLdProduct | null => {
  const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));

  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent ?? "");
      const candidates: unknown[] = Array.isArray(data) ? data : [data];

      for (const item of candidates) {
        if (!isObject(item)) {
          continue;
        }

        // Direct Product type
        if (item["@type"] === "Product" || item["@type"] === "ClothingStore") {
          return item as unknown as JsonLdProduct;
        }

        // Product nested inside @graph
        if (Array.isArray(item["@graph"])) {
          for (const graphItem of item["@graph"]) {
            if (isObject(graphItem) && graphItem["@type"] === "Product") {
              return graphItem as unknown as JsonLdProduct;
            }
          }
        }
      }
    } catch {
      // Malformed JSON-LD — skip
    }
  }

  return null;
};

/**
 * Extract material text from JSON-LD product data.
 */
const extractMaterialFromJsonLd = (product: JsonLdProduct): string => {
  const parts: string[] = [];

  // Direct material field
  if (typeof product.material === "string" && product.material.trim()) {
    parts.push(product.material);
  }

  // additionalProperty (common on ASOS, H&M)
  if (Array.isArray(product.additionalProperty)) {
    for (const prop of product.additionalProperty) {
      const propName = (prop.name ?? "").toLowerCase();
      if (
        (propName.includes("material") ||
          propName.includes("composition") ||
          propName.includes("fabric") ||
          propName.includes("fiber") ||
          propName.includes("content")) &&
        typeof prop.value === "string"
      ) {
        parts.push(prop.value);
      }
    }
  }

  return parts.join("\n");
};

/**
 * Extract price from JSON-LD offers.
 */
const extractPriceFromJsonLd = (product: JsonLdProduct): { price?: number; currency: string } => {
  const offers = Array.isArray(product.offers) ? product.offers[0] : product.offers;
  if (!offers) {
    return { currency: "USD" };
  }

  const rawPrice = offers.price;
  const price = typeof rawPrice === "number"
    ? rawPrice
    : typeof rawPrice === "string"
      ? parseFloat(rawPrice)
      : undefined;

  return {
    price: price && Number.isFinite(price) ? price : undefined,
    currency: offers.priceCurrency ?? "USD"
  };
};

/**
 * Extract image URL from JSON-LD.
 */
const extractImageFromJsonLd = (product: JsonLdProduct): string | undefined => {
  if (typeof product.image === "string") {
    return product.image;
  }
  if (Array.isArray(product.image) && typeof product.image[0] === "string") {
    return product.image[0];
  }
  if (isObject(product.image) && typeof (product.image as Record<string, unknown>).url === "string") {
    return (product.image as Record<string, unknown>).url as string;
  }
  return undefined;
};

/* ------------------------------------------------------------------ */
/*  Meta tag extraction — secondary fallback                          */
/* ------------------------------------------------------------------ */

/**
 * Extract material information from `<meta>` tags.
 * Some retailers put material info in meta description or product-specific meta tags.
 */
const extractMaterialFromMeta = (): string => {
  const parts: string[] = [];

  const metaSelectors = [
    'meta[property="product:material"]',
    'meta[name="product:material"]',
    'meta[property="og:description"]'
  ];

  for (const selector of metaSelectors) {
    const el = document.querySelector(selector);
    if (el instanceof HTMLMetaElement && el.content) {
      parts.push(el.content);
    }
  }

  return parts.join("\n");
};

/* ------------------------------------------------------------------ */
/*  Main extraction pipeline                                          */
/* ------------------------------------------------------------------ */

export const extractProductContext = (): ProductContext | null => {
  const retailerInfo = getRetailerConfigByHostname(window.location.hostname);
  if (!retailerInfo) {
    return null;
  }

  const { config, domain } = retailerInfo;
  const pathname = window.location.pathname;

  if (!looksLikeProductPath(pathname, config.productUrlPatterns)) {
    return null;
  }

  // --- Try JSON-LD first (most reliable) ---
  const jsonLd = extractJsonLdProduct();

  // --- Product name: JSON-LD → CSS selectors ---
  const productName = jsonLd?.name ?? firstNonEmptyText(config.nameSelectors);
  if (!productName) {
    return null;
  }

  // --- Price: JSON-LD → CSS selectors ---
  const jsonLdPrice = jsonLd ? extractPriceFromJsonLd(jsonLd) : null;
  const rawPriceText = firstNonEmptyText(config.priceSelectors);
  const price = jsonLdPrice?.price ?? parsePrice(rawPriceText);
  const currency = jsonLdPrice?.currency ?? inferCurrency(rawPriceText);

  // --- Brand: JSON-LD → retailer config ---
  const jsonLdBrand = jsonLd?.brand
    ? typeof jsonLd.brand === "string"
      ? jsonLd.brand
      : jsonLd.brand.name
    : undefined;
  const brand = jsonLdBrand ?? config.retailer;

  // --- Material/fiber: JSON-LD → Meta → CSS selectors ---
  const jsonLdMaterial = jsonLd ? extractMaterialFromJsonLd(jsonLd) : "";
  const metaMaterial = extractMaterialFromMeta();
  const cssMaterialText = gatherText(config.materialSelectors);
  const descriptionText = jsonLd?.description ?? gatherText(config.descriptionSelectors);
  const genericMaterialText = gatherText(GENERIC_FIBER_SELECTORS);

  // Combine all material sources, giving JSON-LD priority
  const allMaterialText = [
    jsonLdMaterial,
    cssMaterialText,
    metaMaterial,
    genericMaterialText,
  ].filter(Boolean).join("\n");
  const fiberText = gatherFiberText(allMaterialText, descriptionText);
  const fiberContent = normalizeFiberComposition(parseFiberComposition(fiberText));
  const materialExcerpt = truncateForModelInput(dedupeLines(`${allMaterialText}\n${descriptionText}`));

  // --- Category: JSON-LD → URL/name inference ---
  const category = jsonLd?.category ?? inferCategory(`${productName} ${pathname}`);

  // --- Image: JSON-LD → CSS selectors ---
  const imageUrl = (jsonLd ? extractImageFromJsonLd(jsonLd) : undefined) ?? firstImageSrc(config.imageSelectors);

  return {
    productUrl: window.location.href,
    productName,
    brand,
    category,
    currency,
    retailerDomain: domain,
    descriptionText,
    fiberText,
    materialExcerpt,
    fiberContent,
    price,
    imageUrl
  };
};
