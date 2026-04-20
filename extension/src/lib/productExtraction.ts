import {
  extractMetaProductPrice,
  firstImageSrc,
  firstMetaContent,
  firstNonEmptyText,
  gatherText,
  inferCurrency,
  parsePrice,
  scanMainForPriceText,
} from "./dom";
import { normalizeFiberComposition, parseFiberComposition } from "./fiberParser";
import {
  extractJsonLdBundleFromDocument,
  extractPriceFromProductRecord,
} from "./jsonLdProduct";
import {
  getRetailerConfigByHostname,
  inferCategory,
  looksLikeGenericProductPath,
  looksLikeProductPath,
} from "./url";
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
/** Bounded visible text for server-side price LLM when DOM/JSON-LD price is missing */
const MAX_PAGE_TEXT_SNIPPET_CHARS = 12_000;

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

/** Used when the hostname is not in retailerSelectors.json */
const GENERIC_NAME_SELECTORS = [
  "[data-product-title]",
  "h1[itemprop=name]",
  "[itemprop=name]",
  "[data-testid='product-title']",
  "main h1",
  "article h1",
  "#ProductInfo h1",
  "h1",
];

const GENERIC_PRICE_SELECTORS = [
  "[itemprop=price]",
  "[data-product-price]",
  "[data-price]",
  "[data-testid*='price']",
  "[data-testid='product-price']",
  "[data-testid='product-page-price']",
  "[class*='product-price']",
  "[class*='ProductPrice']",
  "[class*='current-price']",
  "[class*='sales-price']",
  "[class*='price-current']",
  ".a-price .a-offscreen",
  "#priceblock_ourprice",
  "#priceblock_dealprice",
  "span[data-price]",
  "[class*='PurchasePrice']",
  "[class*='price__regular']",
];

const GENERIC_DESCRIPTION_SELECTORS = [
  "[itemprop=description]",
  "[data-product-description]",
  ".product-description",
  "[class*='product-details']",
  "main article",
];

const GENERIC_IMAGE_SELECTORS = [
  "[itemprop=image]",
  "img[itemprop=image]",
  "[data-testid='product-image'] img",
  "main picture img",
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
/*  JSON-LD shape (legacy helpers for material / image)               */
/* ------------------------------------------------------------------ */

interface JsonLdProduct {
  name?: string;
  brand?: string | { name?: string };
  description?: string;
  material?: string;
  image?: string | string[] | { url?: string };
  offers?: unknown;
  additionalProperty?: Array<{
    name?: string;
    value?: string;
  }>;
  category?: string;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const extractMaterialFromJsonLd = (product: JsonLdProduct): string => {
  const parts: string[] = [];

  if (typeof product.material === "string" && product.material.trim()) {
    parts.push(product.material);
  }

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

const extractMaterialFromMeta = (): string => {
  const parts: string[] = [];

  const metaSelectors = [
    'meta[property="product:material"]',
    'meta[name="product:material"]',
    'meta[property="og:description"]',
  ];

  for (const selector of metaSelectors) {
    const el = document.querySelector(selector);
    if (el instanceof HTMLMetaElement && el.content) {
      parts.push(el.content);
    }
  }

  return parts.join("\n");
};

const titleFromPage = (): string =>
  firstNonEmptyText(GENERIC_NAME_SELECTORS) ||
  firstMetaContent(['meta[property="og:title"]', 'meta[name="og:title"]']) ||
  document.title.trim();

export const extractProductContext = (): ProductContext | null => {
  const pageUrl = window.location.href;
  const pathname = window.location.pathname;
  const hostname = window.location.hostname.toLowerCase();

  const retailerInfo = getRetailerConfigByHostname(hostname);
  const bundle = extractJsonLdBundleFromDocument(document, pageUrl);
  const jsonLdRecord = bundle.product;
  const legacyProduct = jsonLdRecord as unknown as JsonLdProduct | null;

  const jsonLdMoney = jsonLdRecord
    ? extractPriceFromProductRecord(jsonLdRecord, bundle.idMap)
    : { currency: "USD" as string };

  const metaMoney = extractMetaProductPrice();

  const config = retailerInfo?.config;
  const nameSelectors = config?.nameSelectors ?? GENERIC_NAME_SELECTORS;
  const priceSelectors = config?.priceSelectors ?? GENERIC_PRICE_SELECTORS;
  const materialSelectors = config?.materialSelectors ?? GENERIC_FIBER_SELECTORS;
  const descriptionSelectors = config?.descriptionSelectors ?? GENERIC_DESCRIPTION_SELECTORS;
  const imageSelectors = config?.imageSelectors ?? GENERIC_IMAGE_SELECTORS;

  const retailerPathOk =
    retailerInfo != null && looksLikeProductPath(pathname, retailerInfo.config.productUrlPatterns);

  const jsonLdHasName =
    jsonLdRecord != null &&
    typeof jsonLdRecord.name === "string" &&
    jsonLdRecord.name.trim().length > 0;

  const rawPriceProbe = firstNonEmptyText(priceSelectors);
  const hasPriceSignal =
    jsonLdMoney.price != null ||
    metaMoney.price != null ||
    rawPriceProbe.length > 0;

  const productTitleFallback = titleFromPage();

  const canExtract =
    retailerPathOk ||
    jsonLdHasName ||
    (looksLikeGenericProductPath(pathname) && productTitleFallback.length > 0) ||
    (hasPriceSignal && productTitleFallback.length > 0);

  if (!canExtract) {
    return null;
  }

  const productName =
    (typeof jsonLdRecord?.name === "string" && jsonLdRecord.name.trim()) ||
    firstNonEmptyText(nameSelectors) ||
    productTitleFallback;

  if (!productName.trim()) {
    return null;
  }

  const rawPriceText = firstNonEmptyText(priceSelectors);
  const domParsed = parsePrice(rawPriceText);
  const mainScanPrice = domParsed != null && domParsed > 0 ? undefined : scanMainForPriceText();

  const price = jsonLdMoney.price ?? metaMoney.price ?? domParsed ?? mainScanPrice;

  let currency = "USD";
  if (jsonLdMoney.price != null) {
    currency = jsonLdMoney.currency || "USD";
  } else if (metaMoney.price != null) {
    currency = metaMoney.currency || "USD";
  } else {
    const currencyHint =
      rawPriceText ||
      (price === mainScanPrice ? (document.body?.innerText ?? "").slice(0, 6000) : "");
    currency = inferCurrency(currencyHint);
  }

  const jsonLdBrand = legacyProduct?.brand
    ? typeof legacyProduct.brand === "string"
      ? legacyProduct.brand
      : legacyProduct.brand.name
    : undefined;

  const brand =
    (jsonLdBrand && String(jsonLdBrand).trim()) ||
    (config?.retailer) ||
    hostname.replace(/^www\./, "");

  const jsonLdMaterial = legacyProduct ? extractMaterialFromJsonLd(legacyProduct) : "";
  const metaMaterial = extractMaterialFromMeta();
  const cssMaterialText = gatherText(materialSelectors);
  const descriptionText =
    (typeof legacyProduct?.description === "string" && legacyProduct.description) ||
    gatherText(descriptionSelectors);
  const genericMaterialText = gatherText(GENERIC_FIBER_SELECTORS);

  const allMaterialText = [jsonLdMaterial, cssMaterialText, metaMaterial, genericMaterialText]
    .filter(Boolean)
    .join("\n");
  const fiberText = gatherFiberText(allMaterialText, descriptionText);
  const fiberContent = normalizeFiberComposition(parseFiberComposition(fiberText));
  const materialExcerpt = truncateForModelInput(dedupeLines(`${allMaterialText}\n${descriptionText}`));

  const category =
    (typeof jsonLdRecord?.category === "string" && jsonLdRecord.category) ||
    inferCategory(`${productName} ${pathname}`);

  const ogImage = firstMetaContent([
    "meta[property='og:image']",
    "meta[property='og:image:url']",
    "meta[name='twitter:image']",
  ]);
  const imageUrl =
    (legacyProduct ? extractImageFromJsonLd(legacyProduct) : undefined) ??
    firstImageSrc(imageSelectors) ??
    (ogImage || undefined);

  const retailerDomain = retailerInfo?.domain ?? hostname.replace(/^www\./, "");

  const rootForText =
    document.querySelector("main") ??
    document.querySelector("[role='main']") ??
    document.body;
  const visiblePageText = rootForText ? dedupeLines(rootForText.innerText ?? "") : "";
  const pageTextSnippet =
    price == null || !(price > 0)
      ? truncateForModelInput(visiblePageText, MAX_PAGE_TEXT_SNIPPET_CHARS)
      : undefined;

  return {
    productUrl: pageUrl,
    productName,
    brand,
    category,
    currency,
    retailerDomain,
    descriptionText,
    fiberText,
    materialExcerpt,
    fiberContent,
    price,
    pageTextSnippet,
    imageUrl,
  };
};
