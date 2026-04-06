import { getRetailerConfigByHostname } from './extension/src/lib/url';
import { firstNonEmptyText, gatherText } from './extension/src/lib/dom';

// Mock document for testing selectors
const mockDocument = {
  querySelector: (selector: string) => {
    // This would need to be populated with actual HTML content
    // For now, we'll create a testing framework
    return null;
  },
  querySelectorAll: (selector: string) => {
    return [];
  }
};

// Test selectors for each retailer
const retailers = [
  'zara.com',
  'hm.com',
  'asos.com',
  'shein.com',
  'amazon.com'
];

console.log('Testing Retailer Selectors:');
console.log('==========================');

retailers.forEach(retailer => {
  const config = getRetailerConfigByHostname(retailer);
  if (!config) {
    console.log(`❌ ${retailer}: No config found`);
    return;
  }

  console.log(`\n📍 Testing ${retailer} (${config.config.retailer}):`);
  console.log(`   Product URL patterns: ${config.config.productUrlPatterns.join(', ')}`);
  console.log(`   Name selectors: ${config.config.nameSelectors.length}`);
  console.log(`   Material selectors: ${config.config.materialSelectors.length}`);
  console.log(`   Description selectors: ${config.config.descriptionSelectors.length}`);
});

console.log('\n✅ All retailers have configurations loaded.');
console.log('\nTo test actual selectors, you need to:');
console.log('1. Load the extension in Chrome');
console.log('2. Visit product pages on each retailer');
console.log('3. Check console for [UNRAVEL] logs');
console.log('4. Update selectors in retailerSelectors.json if needed');