# Supabase Edge Functions

The live backend logic for trend analysis and extension scoring is versioned in this directory.

## Layout

- `_shared/` holds reusable helpers shared across functions
- `score/` is the extension scoring endpoint
- `trend-analyze/` is the web app trend analysis endpoint
- `alternatives/` is the product alternatives endpoint imported from the current cloud project
- `trend-image/` is the image analysis endpoint imported from the current cloud project
- `.env.local` is for local `supabase functions serve`
- `.env.production` is for `supabase secrets set` before production deploy
- `cloud-sync.json` records the currently synced remote function versions and hashes

Use [`.env.example`](/Users/dam_kamani/Downloads/Unraveled/supabase/functions/.env.example) as the template for both env files.

## Required environment variables

- `SERP_API_KEY` — used by all functions for Google Trends (TIMESERIES), Google Search, and Google Shopping
- `RAPIDAPI_KEY` — TikTok and Pinterest social signal APIs
- `OPENAI_API_KEY` — image analysis (trend-image function)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WEB_APP_BASE_URL`

## Commands

From the repo root:

```bash
make supabase-start
make supabase-serve-score
make supabase-serve-trend-analyze
make supabase-secrets-push
make supabase-deploy
```

## `trend-analyze` request options

The `trend-analyze` Edge Function accepts JSON POST bodies with:

- `query` (required)
- `input_type` (optional)
- `brand` (optional)
- `skip_cache` (optional boolean): bypasses `trend_cache` reads and forces a fresh Google Trends fetch path.
- `refresh` (optional boolean): legacy alias for `skip_cache`.
- `refresh_social` (optional boolean, default `true`): when Google Trends comes from cache, controls whether TikTok/Pinterest are refreshed and written back to cache.
