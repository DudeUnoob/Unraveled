import { gatherText, firstImageSrc, firstNonEmptyText, inferCurrency, parsePrice } from "./dom";
import { normalizeFiberComposition, parseFiberComposition } from "./fiberParser";
import { getRetailerConfigByHostname, inferCategory, looksLikeProductPath } from "./url";
import type { ProductContext } from "../types";

const gatherFiberText = (materialText: string, descriptionText: string): string => {
  const relevantLines = `${materialText}\n${descriptionText}`
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => /%|cotton|linen|polyester|wool|rayon|viscose|nylon|spandex|acrylic|hemp|lyocell|tencel|pfas|formaldehyde/i.test(line));

  return relevantLines.join("\n");
};

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

  const productName = firstNonEmptyText(config.nameSelectors);
  if (!productName) {
    return null;
  }

  const rawPriceText = firstNonEmptyText(config.priceSelectors);

  const descriptionText = gatherText(config.descriptionSelectors);
  const materialText = gatherText(config.materialSelectors);
  const fiberText = gatherFiberText(materialText, descriptionText);

  const fiberContent = normalizeFiberComposition(parseFiberComposition(fiberText));

  return {
    productUrl: window.location.href,
    productName,
    brand: config.retailer,
    category: inferCategory(`${productName} ${pathname}`),
    currency: inferCurrency(rawPriceText),
    retailerDomain: domain,
    descriptionText,
    fiberText,
    fiberContent,
    price: parsePrice(rawPriceText),
    imageUrl: firstImageSrc(config.imageSelectors)
  };
};
