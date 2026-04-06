# Retailer Selector Testing Guide

## Supported Retailers & Test URLs

### 1. Zara (zara.com)
**Test URL Pattern**: `https://www.zara.com/us/en/[product-name]-p[ID].html`
**Example**: Search for "cotton t-shirt" on zara.com

**Current Selectors**:
- Name: `h1[data-qa-qualifier='product-name']`, `h1`
- Material: `[data-qa*='composition']`, `[data-qa*='material']`, `main`
- Description: `[data-qa='product-detail-description']`, `main`

### 2. H&M (hm.com)
**Test URL Pattern**: `https://www2.hm.com/en_us/productpage.[ID].html`
**Example**: Search for any clothing item on hm.com

**Current Selectors**:
- Name: `h1`, `[data-testid='product-name']`
- Material: `[data-testid='description']`, `[data-testid='product-detail-material']`, `main`
- Description: `[data-testid='description']`, `main`

### 3. ASOS (asos.com)
**Test URL Pattern**: `https://www.asos.com/[brand]/[product]/[ID].html`
**Example**: Search for "t-shirt" on asos.com

**Current Selectors**:
- Name: `h1`, `[data-testid='product-name']`
- Material: `[data-testid='about-me']`, `[id*='about-me']`, `main`
- Description: `[data-testid='description']`, `main`

### 4. Shein (shein.com)
**Test URL Pattern**: `https://us.shein.com/[product-name]-p-[ID]-cat-[CAT].html`
**Example**: Search for any clothing item on shein.com

**Current Selectors**:
- Name: `h1`, `[data-testid='product-intro-name']`
- Material: `[data-testid='product-detail-description']`, `[data-testid='product-intro-detail']`, `main`
- Description: `[data-testid='product-detail-description']`, `main`

### 5. Amazon Fashion (amazon.com)
**Test URL Pattern**: `https://www.amazon.com/dp/[ID]`
**Example**: Search for "cotton t-shirt" on amazon.com

**Current Selectors**:
- Name: `#productTitle`, `h1 span`
- Material: `#productFactsDesktop_feature_div`, `#detailBullets_feature_div`, `#productDescription`, `#aplus_feature_div`
- Description: `#productDescription`, `#feature-bullets`, `#aplus_feature_div`

## Testing Checklist

For each retailer, verify:

1. ✅ Extension loads on product pages
2. ✅ Console shows `[UNRAVEL] Found product name: [NAME]`
3. ✅ Console shows `[UNRAVEL] Material text: [MATERIAL TEXT]`
4. ✅ Console shows `[UNRAVEL] FIBER DATA JSON:` with valid JSON
5. ✅ Fiber content object contains correct material percentages

## If Selectors Fail

### Step 1: Inspect the Page
1. Right-click on product name → "Inspect Element"
2. Find the actual HTML element and its selectors
3. Note the correct CSS selectors

### Step 2: Update retailerSelectors.json
```json
{
  "retailer.com": {
    "nameSelectors": ["[correct-selector]", "[fallback-selector]"],
    "materialSelectors": ["[material-section-selector]"],
    "descriptionSelectors": ["[description-selector]"]
  }
}
```

### Step 3: Rebuild & Test
```bash
cd extension
npm run build
# Reload extension in Chrome
# Test again
```

## Expected JSON Output

```json
{
  "productUrl": "https://www.zara.com/us/en/cotton-t-shirt-p123.html",
  "productName": "Cotton T-Shirt",
  "brand": "Zara",
  "retailer": "zara.com",
  "fiberContent": {
    "cotton": 100
  },
  "rawFiberText": "100% cotton",
  "extractedAt": "2026-03-28T..."
}
```