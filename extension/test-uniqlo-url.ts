import { getRetailerConfigByHostname, looksLikeProductPath } from './src/lib/url';

// Test the Uniqlo URL
const testUrl = 'https://uniqlo.com/us/en/products/E483484-000/00';
const url = new URL(testUrl);

console.log('Testing Uniqlo URL:', testUrl);
console.log('Hostname:', url.hostname);
console.log('Pathname:', url.pathname);

// Check if retailer is recognized
const retailerConfig = getRetailerConfigByHostname(url.hostname);
if (retailerConfig) {
  console.log('✅ Retailer recognized:', retailerConfig.config.retailer);
  console.log('Product URL patterns:', retailerConfig.config.productUrlPatterns);

  // Check if path matches product patterns
  const isProductPage = looksLikeProductPath(url.pathname, retailerConfig.config.productUrlPatterns);
  console.log('✅ Path matches product patterns:', isProductPage);

  console.log('Name selectors:', retailerConfig.config.nameSelectors);
  console.log('Material selectors:', retailerConfig.config.materialSelectors);
  console.log('Description selectors:', retailerConfig.config.descriptionSelectors);
} else {
  console.log('❌ Retailer not recognized');
}