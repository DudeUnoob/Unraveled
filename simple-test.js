// Simple test of fiber parsing
const { parseFiberComposition } = require('./extension/dist/assets/fiberParser.js');

const testTexts = [
  "100% cotton",
  "50% cotton, 50% polyester",
  "Shell: 100% polyester; Lining: 100% cotton"
];

console.log("Fiber Parser Test Results:");
testTexts.forEach((text, index) => {
  const result = parseFiberComposition(text);
  console.log(`\nTest ${index + 1}: "${text}"`);
  console.log("Result:", result);
});