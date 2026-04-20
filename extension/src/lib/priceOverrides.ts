import type { ProductContext } from "../types";

const storageKeyForUrl = (productUrl: string): string =>
  `unravel:price-override:${encodeURIComponent(productUrl)}`;

export async function readPriceOverride(productUrl: string): Promise<number | undefined> {
  const key = storageKeyForUrl(productUrl);
  const result = await chrome.storage.local.get(key);
  const raw = result[key];
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) {
    return undefined;
  }
  return raw;
}

export async function writePriceOverride(productUrl: string, price: number): Promise<void> {
  const key = storageKeyForUrl(productUrl);
  await chrome.storage.local.set({ [key]: price });
}

export async function mergePriceOverride(product: ProductContext): Promise<ProductContext> {
  const override = await readPriceOverride(product.productUrl);
  if (override != null) {
    return { ...product, price: override };
  }
  return product;
}
