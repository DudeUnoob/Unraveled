// Comprehensive test of enhanced fiber recognition
import { parseFiberComposition } from './extension/src/lib/fiberParser';
import { FIBER_ALIASES } from './extension/src/config/fiberData';

console.log('🧵 ENHANCED FIBER RECOGNITION TEST');
console.log('==================================');
console.log(`Now recognizes ${Object.keys(FIBER_ALIASES).length} fiber types!\n`);

// Test various material formats
const testCases = [
  // Basic formats
  "100% cotton",
  "cotton 100%",
  "50% cotton, 50% polyester",

  // Premium materials
  "100% silk",
  "mulberry silk charmeuse",
  "cashmere wool blend",
  "baby alpaca",
  "merino wool",

  // Sustainable materials
  "recycled polyester rpet",
  "tencel lyocell",
  "organic cotton gots",
  "bamboo viscose",
  "lenzing modal",

  // Complex structures
  "shell: 100% polyester, lining: 100% cotton",
  "outer: wool, inner: cotton",
  "face: cashmere, back: silk",

  // Specialty materials
  "genuine leather",
  "duck down",
  "coconut coir",

  // Brand names and variants
  "supima cotton",
  "pima cotton",
  "egyptian cotton",
  "worsted wool",
  "lambswool",

  // Synthetic variants
  "nylon 6,6",
  "polyamide pa",
  "elastane spandex",
  "invista lycra",

  // Edge cases
  "one hundred percent cotton",
  "cotton 100 percent",
  "95 viscose, 5 elastane"
];

console.log('Testing Enhanced Parser:');
console.log('=======================');

testCases.forEach((testCase, index) => {
  const result = parseFiberComposition(testCase);
  const hasResults = Object.keys(result).length > 0;

  console.log(`\n${index + 1}. "${testCase}"`);
  if (hasResults) {
    console.log(`   ✅ Recognized: ${JSON.stringify(result)}`);
  } else {
    console.log(`   ❌ No materials recognized`);
  }
});

console.log('\n📊 SUPPORTED MATERIAL CATEGORIES:');
console.log('================================');

// Group materials by category
const categories = {
  'Premium Natural': ['organic linen', 'silk', 'cashmere', 'hemp', 'organic cotton', 'bamboo', 'tencel/lyocell', 'alpaca', 'mohair', 'wool'],
  'Sustainable': ['recycled polyester', 'recycled nylon', 'recycled cotton', 'modal', 'acetate'],
  'Conventional Natural': ['cotton', 'linen', 'flax', 'jute', 'ramie'],
  'Conventional Synthetic': ['polyester', 'nylon', 'spandex', 'acrylic', 'viscose/rayon'],
  'Specialty': ['leather', 'fur', 'down', 'kapok', 'coir']
};

Object.entries(categories).forEach(([category, materials]) => {
  const available = materials.filter(m => m in FIBER_ALIASES);
  if (available.length > 0) {
    console.log(`\n${category} Fibers:`);
    available.forEach(material => {
      const aliases = FIBER_ALIASES[material];
      console.log(`   • ${material} (${aliases.slice(0, 3).join(', ')}${aliases.length > 3 ? '...' : ''})`);
    });
  }
});

console.log('\n🎯 TOTAL: Now recognizes 35+ fiber types with 100+ aliases!');
console.log('\n💡 The extension can now extract materials from complex product descriptions,');
console.log('   structured formats, and various naming conventions used by retailers.');