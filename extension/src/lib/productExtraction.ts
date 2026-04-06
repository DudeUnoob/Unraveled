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
    console.log('[UNRAVEL] Unsupported domain:', window.location.hostname);
    return null;
  }

  const { config, domain } = retailerInfo;
  const pathname = window.location.pathname;

  if (!looksLikeProductPath(pathname, config.productUrlPatterns)) {
    console.log('[UNRAVEL] Path does not match product patterns:', pathname, config.productUrlPatterns);
    return null;
  }

  const productName = firstNonEmptyText(config.nameSelectors);
  if (!productName) {
    console.log('[UNRAVEL] No product name found with selectors:', config.nameSelectors);
    return null;
  }

  console.log('[UNRAVEL] Found product name:', productName);

  const rawPriceText = firstNonEmptyText(config.priceSelectors);
  console.log('[UNRAVEL] Price text found:', rawPriceText, 'with selectors:', config.priceSelectors);

  const descriptionText = gatherText(config.descriptionSelectors);
  const materialText = gatherText(config.materialSelectors);
  const fiberText = gatherFiberText(materialText, descriptionText);

  console.log('[UNRAVEL] Material text:', materialText);
  console.log('[UNRAVEL] Description text:', descriptionText);
  console.log('[UNRAVEL] Fiber text extracted:', fiberText);

  const fiberContent = normalizeFiberComposition(parseFiberComposition(fiberText));
  console.log('[UNRAVEL] Parsed fiber content:', fiberContent);

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
