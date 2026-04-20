/**
 * Extract Product + price from JSON-LD (schema.org) blocks — primary price source
 * for Shopify, WooCommerce, many DTC brands, and major retailers.
 */

export interface JsonLdBundle {
  product: Record<string, unknown> | null;
  idMap: Map<string, Record<string, unknown>>;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const typeNames = (node: Record<string, unknown>): string[] => {
  const t = node["@type"];
  if (typeof t === "string") {
    return [t];
  }
  if (Array.isArray(t)) {
    return t.filter((x): x is string => typeof x === "string");
  }
  return [];
};

const isProductNode = (node: Record<string, unknown>): boolean =>
  typeNames(node).some(
    (x) =>
      x === "Product" ||
      x.endsWith("/Product") ||
      x === "IndividualProduct" ||
      x.includes("Product"),
  );

function flattenJsonLd(value: unknown, idMap: Map<string, Record<string, unknown>>): unknown[] {
  if (value === null || value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((v) => flattenJsonLd(v, idMap));
  }
  if (!isRecord(value)) {
    return [];
  }

  const id = value["@id"];
  if (typeof id === "string" && id.length > 0) {
    idMap.set(id, value);
  }

  const graph = value["@graph"];
  if (Array.isArray(graph)) {
    return graph.flatMap((g) => flattenJsonLd(g, idMap));
  }

  return [value];
}

export function extractJsonLdBundleFromDocument(doc: Document, _pageUrl: string): JsonLdBundle {
  const idMap = new Map<string, Record<string, unknown>>();
  const nodes: Record<string, unknown>[] = [];

  for (const el of Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))) {
    const raw = el.textContent?.trim();
    if (!raw) {
      continue;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      for (const item of flattenJsonLd(parsed, idMap)) {
        if (isRecord(item)) {
          nodes.push(item);
        }
      }
    } catch {
      /* ignore malformed JSON-LD */
    }
  }

  let product: Record<string, unknown> | null = nodes.find(isProductNode) ?? null;
  if (!product) {
    product = nodes.find((n) => "offers" in n && typeof n["name"] === "string") ?? null;
  }

  return { product, idMap };
}

const parseMoney = (
  price: unknown,
  currency: unknown,
): { price: number; currency: string } | null => {
  let amount: number | undefined;
  if (typeof price === "number" && Number.isFinite(price)) {
    amount = price;
  } else if (typeof price === "string") {
    const n = parseFloat(price.replace(/,/g, ""));
    if (Number.isFinite(n)) {
      amount = n;
    }
  }

  if (amount == null || amount <= 0) {
    return null;
  }

  let cur = "USD";
  if (typeof currency === "string" && currency.trim().length >= 3) {
    cur = currency.trim().toUpperCase().slice(0, 3);
  }

  return { price: amount, currency: cur };
};

const resolveRef = (
  offer: unknown,
  idMap: Map<string, Record<string, unknown>>,
): Record<string, unknown> | null => {
  if (typeof offer === "string") {
    return idMap.get(offer) ?? null;
  }
  return isRecord(offer) ? offer : null;
};

const moneyFromOfferRecord = (
  offer: Record<string, unknown>,
): { price: number; currency: string } | null => {
  const types = typeNames(offer);
  const isAggregate = types.some((t) => t.includes("AggregateOffer"));

  const priceFields = isAggregate
    ? [offer.lowPrice, offer.highPrice, offer.price]
    : [offer.price, offer.lowPrice];

  const currency = offer.priceCurrency ?? offer.pricecurrency;

  for (const p of priceFields) {
    const m = parseMoney(p, currency);
    if (m) {
      return m;
    }
  }

  const spec = offer.priceSpecification;
  const specs = Array.isArray(spec) ? spec : spec != null ? [spec] : [];
  for (const s of specs) {
    const rec = isRecord(s) ? s : null;
    if (!rec) {
      continue;
    }
    const m = parseMoney(rec.price ?? rec.minPrice, rec.priceCurrency ?? currency);
    if (m) {
      return m;
    }
  }

  return null;
};

function walkOffers(
  offers: unknown,
  idMap: Map<string, Record<string, unknown>>,
): { price: number; currency: string } | null {
  if (offers == null) {
    return null;
  }

  if (Array.isArray(offers)) {
    for (const o of offers) {
      const resolved = resolveRef(o, idMap);
      if (!resolved) {
        continue;
      }
      const m = moneyFromOfferRecord(resolved);
      if (m) {
        return m;
      }
    }
    return null;
  }

  const resolved = resolveRef(offers, idMap);
  if (!resolved) {
    return null;
  }

  return moneyFromOfferRecord(resolved);
}

/**
 * Best-effort price from a schema.org Product (or compatible) node.
 */
export function extractPriceFromProductRecord(
  product: Record<string, unknown>,
  idMap: Map<string, Record<string, unknown>>,
): { price?: number; currency: string } {
  const fromOffers = walkOffers(product["offers"], idMap);
  if (fromOffers) {
    return { price: fromOffers.price, currency: fromOffers.currency };
  }

  return { currency: "USD" };
}
