export const normalizeText = (value: string | null | undefined): string => {
  if (!value) {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
};

export const firstNonEmptyText = (selectors: string[]): string => {
  for (const selector of selectors) {
    const node = document.querySelector(selector);
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

export const parsePrice = (value: string): number | undefined => {
  const clean = value.replace(/,/g, "");
  const match = clean.match(/(\d+(?:\.\d+)?)/);
  if (!match) {
    return undefined;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : undefined;
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
