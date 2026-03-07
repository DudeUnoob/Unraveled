---
description: How to switch the Unravel stack between local dev and production
---

# Dev ↔ Production Switching

The entire Unravel stack uses **environment variables** to switch between local dev and production. No code changes needed.

## Quick Reference

| Component | Variable | Dev Value | Production Value |
|-----------|----------|-----------|-----------------|
| Edge Functions | `WEB_APP_BASE_URL` (Supabase secret) | `http://localhost:3000` | `https://unraveled-kappa.vercel.app` (default) |
| Extension | `VITE_UNRAVEL_WEB_APP_URL` (in `.env`) | `http://localhost:3000` | `https://unraveled-kappa.vercel.app` |
| Web App | `NEXT_PUBLIC_SUPABASE_URL` (in `.env.local`) | Same for both | Same for both |

## Switching to Local Dev

// turbo
1. **Extension**: Edit `extension/.env` — set `VITE_UNRAVEL_WEB_APP_URL=http://localhost:3000`

// turbo
2. **Extension**: Rebuild — run `cd extension && ./node_modules/.bin/vite build`

3. **Extension**: Reload in Chrome — go to `chrome://extensions` and click the refresh icon on Unravel

// turbo
4. **Web App**: Start dev server — run `cd web && npm run dev`

5. **Edge Functions** (optional): If you want the Edge Function deep links to point to localhost too, set the `WEB_APP_BASE_URL` Supabase secret to `http://localhost:3000` via the Supabase Dashboard > Project Settings > Secrets. Otherwise, Edge Functions default to production which is usually fine.

## Switching to Production

// turbo
1. **Extension**: Edit `extension/.env` — set `VITE_UNRAVEL_WEB_APP_URL=https://unraveled-kappa.vercel.app`

// turbo
2. **Extension**: Rebuild — run `cd extension && ./node_modules/.bin/vite build`

3. **Extension**: Reload in Chrome

4. **Edge Functions**: No action needed — they default to production URL. If you previously set `WEB_APP_BASE_URL` to localhost, remove or update the secret.

5. **Web App**: Deploy via `git push` (auto-deploys to Vercel)

## Key URLs

- **Production Web App**: https://unraveled-kappa.vercel.app
- **Local Web App**: http://localhost:3000
- **Supabase API**: https://fmndxwcgyzevetcoizwd.supabase.co
- **Edge Functions**: https://fmndxwcgyzevetcoizwd.supabase.co/functions/v1/{score,trend-analyze}
