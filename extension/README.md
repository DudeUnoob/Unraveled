# Unravel Chrome Extension (Stage 1)

This folder contains the Chrome extension implementation aligned with `app_context/PRD_Chrome_Extention.md`.

## Implemented requirements

- `E-1.1` Product page detection on supported retailers
- `E-1.2` Fiber content extraction and normalization from page DOM
- `E-1.3` Backend ML sustainability scoring integration
- `E-1.4` Brand reputation feature from live backend data (includes ESG metadata)
- `E-1.5` Trend feature from live backend data (Google Trends source metadata required)
- `E-1.6` Health impact score from backend response
- `E-1.7` Cost-per-wear estimate from backend response
- `E-1.8` React popup panel
- `E-1.9` “See Full Trend Analysis” deep link
- `E-1.10` Extension icon badge coloring
- `E-1.11` Manual fiber input fallback in popup (backend scoring only)

## Environment

Create an `.env` file in `extension/` using this shape:

```bash
VITE_UNRAVEL_API_BASE_URL=http://localhost:8000
VITE_UNRAVEL_SCORE_TIMEOUT_MS=8000
```

- `VITE_UNRAVEL_API_BASE_URL` is used by the service worker for `POST /api/v1/score`.
- The manifest automatically adds host permission for the configured API origin.

## Development

```bash
cd extension
npm install
npm run build
```

Load the built extension from `extension/dist` in Chrome (`chrome://extensions` -> Developer mode -> Load unpacked).

## Runtime behavior

- Extension scoring is **real-data only**. There is no local heuristic score fallback.
- Score responses must include Google Trends and ESG source metadata.
- If live scoring fails, the extension may show the last real score for up to 6 hours (`stale` state).
- If no fresh cached real score exists, the popup shows an unavailable/error state instead of fabricated values.
- Retailer selectors are maintained in `src/config/retailerSelectors.json` for easier updates when site DOMs change.
