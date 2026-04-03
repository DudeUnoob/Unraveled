#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUPABASE_DIR="$ROOT_DIR/supabase"
FUNCTIONS_DIR="$SUPABASE_DIR/functions"
LOCAL_ENV_FILE="$FUNCTIONS_DIR/.env.local"
PROD_ENV_FILE="$FUNCTIONS_DIR/.env.production"
DEFAULT_PROJECT_REF="fmndxwcgyzevetcoizwd"
PROJECT_REF="${SUPABASE_PROJECT_REF:-$DEFAULT_PROJECT_REF}"

run_supabase() {
  if command -v supabase >/dev/null 2>&1; then
    supabase "$@"
  else
    npx --yes supabase@latest "$@"
  fi
}

require_file() {
  local path="$1"
  if [[ ! -f "$path" ]]; then
    echo "Missing required file: $path" >&2
    exit 1
  fi
}

usage() {
  cat <<EOF
Usage:
  ./scripts/supabase-functions.sh start
  ./scripts/supabase-functions.sh stop
  ./scripts/supabase-functions.sh status
  ./scripts/supabase-functions.sh serve [function-name]
  ./scripts/supabase-functions.sh link [project-ref]
  ./scripts/supabase-functions.sh secrets [env-file]
  ./scripts/supabase-functions.sh deploy [function-name]

Environment:
  SUPABASE_PROJECT_REF   Defaults to $DEFAULT_PROJECT_REF
  SUPABASE_ACCESS_TOKEN  Required by deploy/secrets when using remote project APIs
EOF
}

command_name="${1:-}"

if [[ -z "$command_name" ]]; then
  usage
  exit 1
fi

shift || true

case "$command_name" in
  start)
    run_supabase start
    ;;

  stop)
    run_supabase stop
    ;;

  status)
    run_supabase status
    ;;

  serve)
    function_name="${1:-}"
    if [[ -f "$LOCAL_ENV_FILE" ]]; then
      if [[ -n "$function_name" ]]; then
        run_supabase functions serve "$function_name" --env-file "$LOCAL_ENV_FILE"
      else
        run_supabase functions serve --env-file "$LOCAL_ENV_FILE"
      fi
    else
      echo "Local env file not found at $LOCAL_ENV_FILE" >&2
      echo "Copy supabase/functions/.env.example to supabase/functions/.env.local first." >&2
      exit 1
    fi
    ;;

  link)
    project_ref="${1:-$PROJECT_REF}"
    run_supabase link --project-ref "$project_ref"
    ;;

  secrets)
    env_file="${1:-$PROD_ENV_FILE}"
    require_file "$env_file"
    run_supabase secrets set --project-ref "$PROJECT_REF" --env-file "$env_file"
    ;;

  deploy)
    function_name="${1:-}"

    if [[ -f "$PROD_ENV_FILE" ]]; then
      run_supabase secrets set --project-ref "$PROJECT_REF" --env-file "$PROD_ENV_FILE"
    else
      echo "Warning: $PROD_ENV_FILE not found. Skipping remote secret sync." >&2
    fi

    if [[ -n "$function_name" ]]; then
      run_supabase functions deploy "$function_name" --project-ref "$PROJECT_REF" --use-api
    else
      run_supabase functions deploy --project-ref "$PROJECT_REF" --use-api
    fi
    ;;

  *)
    usage
    exit 1
    ;;
esac
