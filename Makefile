SUPABASE_SCRIPT := ./scripts/supabase-functions.sh

.PHONY: supabase-start supabase-stop supabase-status supabase-serve-score supabase-serve-trend-analyze supabase-link supabase-secrets-push supabase-deploy supabase-deploy-score supabase-deploy-trend-analyze

supabase-start:
	$(SUPABASE_SCRIPT) start

supabase-stop:
	$(SUPABASE_SCRIPT) stop

supabase-status:
	$(SUPABASE_SCRIPT) status

supabase-serve-score:
	$(SUPABASE_SCRIPT) serve score

supabase-serve-trend-analyze:
	$(SUPABASE_SCRIPT) serve trend-analyze

supabase-link:
	$(SUPABASE_SCRIPT) link

supabase-secrets-push:
	$(SUPABASE_SCRIPT) secrets

supabase-deploy:
	$(SUPABASE_SCRIPT) deploy

supabase-deploy-score:
	$(SUPABASE_SCRIPT) deploy score

supabase-deploy-trend-analyze:
	$(SUPABASE_SCRIPT) deploy trend-analyze
