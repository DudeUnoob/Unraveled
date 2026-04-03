# Unraveled

## Supabase organization

This repo now treats `supabase/` as the source of truth for backend assets:

- [config.toml](/Users/dam_kamani/Downloads/Unraveled/supabase/config.toml) for local CLI/runtime config
- [functions](/Users/dam_kamani/Downloads/Unraveled/supabase/functions) for Edge Function code
- [migrations](/Users/dam_kamani/Downloads/Unraveled/supabase/migrations) for database schema changes

Today, the repo-managed Edge Functions are:

- [score](/Users/dam_kamani/Downloads/Unraveled/supabase/functions/score/index.ts)
- [trend-analyze](/Users/dam_kamani/Downloads/Unraveled/supabase/functions/trend-analyze/index.ts)
- [alternatives](/Users/dam_kamani/Downloads/Unraveled/supabase/functions/alternatives/index.ts)
- [trend-image](/Users/dam_kamani/Downloads/Unraveled/supabase/functions/trend-image/index.ts)

The current remote function metadata is tracked in [cloud-sync.json](/Users/dam_kamani/Downloads/Unraveled/supabase/functions/cloud-sync.json).

## Local workflow

1. Copy [`.env.example`](/Users/dam_kamani/Downloads/Unraveled/supabase/functions/.env.example) to `supabase/functions/.env.local`
2. Fill in local secrets
3. Start the local Supabase stack:

```bash
make supabase-start
```

4. Serve a function locally:

```bash
make supabase-serve-score
make supabase-serve-trend-analyze
```

If the Supabase CLI is not installed globally, the repo script automatically falls back to `npx supabase@latest`.

## Production deploy

1. Copy [`.env.example`](/Users/dam_kamani/Downloads/Unraveled/supabase/functions/.env.example) to `supabase/functions/.env.production`
2. Fill in production secrets
3. Export a Supabase access token in your shell:

```bash
export SUPABASE_ACCESS_TOKEN=your-token
```

4. Optionally override the project ref:

```bash
export SUPABASE_PROJECT_REF=fmndxwcgyzevetcoizwd
```

5. Push secrets and deploy all repo-managed functions:

```bash
make supabase-deploy
```

Or deploy one function:

```bash
make supabase-deploy-score
make supabase-deploy-trend-analyze
```

The deploy flow uses `supabase secrets set` and then `supabase functions deploy --use-api`, so it works even if Docker is not being used for deployment.

Note: [alternatives](/Users/dam_kamani/Downloads/Unraveled/supabase/functions/alternatives/index.ts) is now synced from the cloud project but still depends on `SERP_API_KEY` until it is migrated off SerpApi.
