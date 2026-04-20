export const normalizeText = (value: string | null | undefined): string => {
  if (!value) {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
};

export const firstNonEmptyText = (selectors: string[]): string => {
  for (const selector of selectors) {
    const node = document.querySelector(selector);
    if (node instanceof HTMLMetaElement) {
      const text = normalizeText(node.content);
      if (text) {
        return text;
      }
      continue;
    }
    const text = normalizeText(node?.textContent);
    if (text) {
      return text;
    }
  }

  return "";
};

export const gatherText = (selectors: string[]): string => {
  const values = selectors
    .flatMap((selector) => Array.from(document.querySelectorAll(selector)))
    .map((node) => normalizeText(node.textContent))
    .filter(Boolean);

  return values.join("\n");
};

export const firstMetaContent = (selectors: string[]): string => {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el instanceof HTMLMetaElement) {
      const c = normalizeText(el.content);
      if (c) {
        return c;
      }
    }
  }
  return "";
};

export const firstImageSrc = (selectors: string[]): string | undefined => {
  for (const selector of selectors) {
    const node = document.querySelector(selector);
    if (!node) {
      continue;
    }

    if (node instanceof HTMLImageElement) {
      if (node.src) {
        return node.src;
      }
    }

    const img = node.querySelector("img");
    if (img instanceof HTMLImageElement && img.src) {
      return img.src;
    }
  }

  return undefined;
};

/**
 * Parse a price from visible text or meta content.
 * Prefers the last currency-like amount (often the sale/current price after "Was …").
 * Handles EU decimals (e.g. 29,99) when the comma is clearly the decimal separator.
 */
export const parsePrice = (value: string): number | undefined => {
  if (!value?.trim()) {
    return undefined;
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  // Explicit sale / now patterns (take the captured amount)
  const saleMatch = normalized.match(
    /(?:now|sale|current|only)\s*[:\s]*(?:[$€£])?\s*([\d,]+\.?\d*)/i,
  );
  if (saleMatch?.[1]) {
    const p = parseSinglePriceToken(saleMatch[1]);
    if (p != null) {
      return p;
    }
  }

  // Currency-prefixed amounts — prefer last (often current price in a row of tiers)
  const prefixAmounts = [...normalized.matchAll(/[$€£]\s*([\d,.]+)/g)];
  if (prefixAmounts.length > 0) {
    const last = prefixAmounts[prefixAmounts.length - 1]?.[1];
    if (last) {
      const p = parseSinglePriceToken(last);
      if (p != null) {
        return p;
      }
    }
  }

  const suffixAmounts = [...normalized.matchAll(/([\d,.]+)\s*[$€£]/g)];
  if (suffixAmounts.length > 0) {
    const last = suffixAmounts[suffixAmounts.length - 1]?.[1];
    if (last) {
      const p = parseSinglePriceToken(last);
      if (p != null) {
        return p;
      }
    }
  }

  // Fallback: last standalone number token in the string
  const tokens = normalized.match(/[\d,.]+/g);
  if (tokens?.length) {
    for (let i = tokens.length - 1; i >= 0; i--) {
      const p = parseSinglePriceToken(tokens[i]!);
      if (p != null) {
        return p;
      }
    }
  }

  return undefined;
};

/** Parse one numeric token that may use comma as thousands or decimal. */
export const parseSinglePriceToken = (token: string): number | undefined => {
  const s = token.trim();
  if (!s) {
    return undefined;
  }

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");

  if (hasComma && hasDot) {
    // 1.299,99 → EU; 1,299.99 → US
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      const n = parseFloat(s.replace(/\./g, "").replace(",", "."));
      return Number.isFinite(n) ? n : undefined;
    }
    const n = parseFloat(s.replace(/,/g, ""));
    return Number.isFinite(n) ? n : undefined;
  }

  if (hasComma && !hasDot) {
    const parts = s.split(",");
    if (parts.length === 2 && parts[1]!.length <= 2 && /^\d+$/.test(parts[1]!)) {
      const n = parseFloat(`${parts[0]!.replace(/\./g, "")}.${parts[1]}`);
      return Number.isFinite(n) ? n : undefined;
    }
    const n = parseFloat(s.replace(/,/g, ""));
    return Number.isFinite(n) ? n : undefined;
  }

  const n = parseFloat(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
};

export const inferCurrency = (value: string): string => {
  if (value.includes("$") || /usd/i.test(value)) {
    return "USD";
  }

  if (value.includes("€") || /eur/i.test(value)) {
    return "EUR";
  }

  if (value.includes("£") || /gbp/i.test(value)) {
    return "GBP";
  }

  return "USD";
};

/** Read Open Graph / Facebook product price meta tags (common on Shopify). */
export const extractMetaProductPrice = (): { price?: number; currency: string } => {
  const pick = (selector: string): string => {
    const el = document.querySelector(selector);
    return el instanceof HTMLMetaElement ? (el.content ?? "").trim() : "";
  };

  const amount =
    pick('meta[property="product:price:amount"]') ||
    pick('meta[property="og:price:amount"]') ||
    pick('meta[name="twitter:data1"]'); // some themes

  const currencyRaw =
    pick('meta[property="product:price:currency"]') ||
    pick('meta[property="og:price:currency"]');

  const price = amount ? parsePrice(amount) : undefined;
  const currency = currencyRaw || inferCurrency(amount);

  return {
    price: price != null && price > 0 ? price : undefined,
    currency: currency.length === 3 ? currency.toUpperCase() : inferCurrency(amount),
  };
};

/**
 * Last-resort: find a currency amount in main content (many SPAs omit JSON-LD or use shadow DOM).
 * Prefer lines that look like real prices; ignore tiny numbers and huge outliers.
 */
export const scanMainForPriceText = (): number | undefined => {
  const root =
    document.querySelector("main") ??
    document.querySelector("[role='main']") ??
    document.body;
  if (!root) {
    return undefined;
  }

  const text = (root.innerText ?? "").replace(/\s+/g, " ");
  const lineCandidates = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => /[$€£]\s*[\d,.]+|[\d,.]+\s*[$€£]|(?:^|\s)\d+[\d,.]*\s*(?:USD|EUR|GBP)\b/i.test(l));

  for (const line of lineCandidates.slice(0, 80)) {
    const p = parsePrice(line);
    if (p != null && p >= 0.5 && p < 500_000) {
      return p;
    }
  }

  const tokenMatches = [...text.matchAll(/[$€£]\s*([\d,.]+)/g)];
  if (tokenMatches.length > 0) {
    const last = tokenMatches[tokenMatches.length - 1]?.[1];
    if (last) {
      const p = parseSinglePriceToken(last);
      if (p != null && p >= 0.5 && p < 500_000) {
        return p;
      }
    }
  }

  return undefined;
};
