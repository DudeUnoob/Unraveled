/**
 * Normalizes a raw query string for display and storage.
 * If the input is a URL, extracts a human-readable product name from the pathname.
 * Non-URL strings are returned as-is.
 */

const LOCALE_SEGMENTS = new Set([
  "us", "en", "uk", "gb", "fr", "de", "es", "it", "pt", "nl", "au", "ca", "jp", "kr", "cn",
  "mx", "br", "se", "no", "dk", "fi", "pl", "at", "ch", "be", "ie", "nz", "sg", "hk", "za",
  "ar", "cl", "co", "in", "tr", "ae", "sa", "ru",
  "en-us", "en-gb", "en-au", "en-ca",
]);

const STRUCTURAL_SEGMENTS = new Set([
  "products", "product", "collections", "collection",
  "shop", "store", "shopping", "buy",
  "item", "items", "listing", "listings",
  "category", "categories", "cat", "c",
  "department", "dept",
  "dp", "gp", "d", "b", "p", "l",
  "productpage", "prd", "goods-detail",
  "detail", "details", "view", "show",
  "new", "sale", "clearance", "trending",
  "men", "women", "kids", "baby", "girls", "boys", "unisex",
  "home", "index", "search", "results",
]);

const PRODUCT_ID_SUFFIX_RE = /-[a-z]?\d{5,}$/i;
const FILE_EXTENSION_RE = /\.(html?|aspx?|php|jsp|cfm)$/i;

function looksLikeUrl(text: string): boolean {
  const t = text.trim();
  return /^https?:\/\//i.test(t) || t.startsWith("//");
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function segmentToName(segment: string): string {
  let s = segment.replace(FILE_EXTENSION_RE, "").replace(PRODUCT_ID_SUFFIX_RE, "");
  s = s.replace(/[-_]+/g, " ").trim();
  return toTitleCase(s);
}

function isStructuralSegment(segment: string): boolean {
  const lower = segment.toLowerCase();
  if (STRUCTURAL_SEGMENTS.has(lower) || LOCALE_SEGMENTS.has(lower)) return true;
  if (/^\d+$/.test(segment)) return true;
  if (/^[a-z]{0,2}\d{4,}$/i.test(segment)) return true;
  return false;
}

function extractNameFromPathname(pathname: string): string | null {
  const segments = pathname
    .split("/")
    .map((s) => decodeURIComponent(s).trim())
    .filter(Boolean);

  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    const cleaned = seg.replace(FILE_EXTENSION_RE, "").replace(PRODUCT_ID_SUFFIX_RE, "");
    if (cleaned.length < 3) continue;
    if (isStructuralSegment(cleaned)) continue;
    if (!/[a-zA-Z]/.test(cleaned)) continue;
    return segmentToName(seg);
  }

  return null;
}

function hostnameToName(hostname: string): string {
  return toTitleCase(hostname.replace(/^www\./i, "").split(".")[0]);
}

/**
 * Normalizes a raw query string.
 *
 * - If the input is a URL: extracts a human-readable product name from the pathname.
 *   Falls back to the domain name if no descriptive segment is found.
 * - If the input is not a URL: returns it trimmed, unchanged.
 * - If the URL is malformed or parsing fails: returns the input trimmed, unchanged.
 *
 * @example
 * normalizeQueryText("https://www.zara.com/us/en/quilted-linen-jacket-p12345678.html")
 * // → "Quilted Linen Jacket"
 *
 * normalizeQueryText("barrel leg jeans")
 * // → "barrel leg jeans"
 */
export function normalizeQueryText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed || !looksLikeUrl(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const name = extractNameFromPathname(url.pathname);
    if (name && name.length >= 3) return name;
    return hostnameToName(url.hostname);
  } catch {
    return trimmed;
  }
}
