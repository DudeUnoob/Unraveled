// Simple test of fiber parsing
const fs = require('fs');
const path = require('path');

const fiberParserPath = path.resolve(__dirname, 'extension/dist/assets/fiberParser.js');

if (!fs.existsSync(fiberParserPath)) {
  console.error(
    `Missing build artifact: ${fiberParserPath}\n` +
    'Build the extension before running this script so extension/dist/assets/fiberParser.js is available.'
  );
  process.exit(1);
}

const { parseFiberComposition } = require(fiberParserPath);
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