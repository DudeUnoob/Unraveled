import { parseFiberComposition } from './lib/fiberParser';

// Test fiber parsing with sample text
const testTexts = [
  "100% cotton",
  "cotton 100%",
  "50% cotton, 50% polyester",
  "Shell: 100% polyester; Lining: 100% cotton",
  "Cotton (100%)",
  "Polyester 80%, Cotton 20%",
  "Made of organic cotton and recycled polyester",
  "95% viscose, 5% elastane"
];

console.log("Testing Fiber Parser:");
console.log("====================");

testTexts.forEach((text, index) => {
  const result = parseFiberComposition(text);
  console.log(`\nTest ${index + 1}: "${text}"`);
  console.log("Parsed:", JSON.stringify(result, null, 2));
});

// Example output format for your JSON
const exampleOutput = {
  productUrl: "https://example.com/product/123",
  productName: "Cotton T-Shirt",
  brand: "Example Brand",
  retailer: "example.com",
  fiberContent: {
    "cotton": 100
  },
  rawFiberText: "100% cotton",
  extractedAt: new Date().toISOString()
};

console.log("\n\nExample JSON Output Format:");
console.log("===========================");
console.log(JSON.stringify(exampleOutput, null, 2));