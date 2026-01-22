#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI not found. Install it, then retry."
  exit 1
fi

if [[ ! -f ".env.local" ]]; then
  echo "Missing .env.local. Create it from .env.example and set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY."
  exit 1
fi

set -a
# shellcheck disable=SC1091
source ".env.local"
set +a

if [[ -z "${VITE_SUPABASE_URL:-}" ]]; then
  echo "Missing VITE_SUPABASE_URL in .env.local."
  exit 1
fi

PROJECT_REF="$(
  printf '%s' "$VITE_SUPABASE_URL" |
    sed -E 's#https?://([^./]+)\\.supabase\\.co.*#\\1#'
)"

if [[ -z "${PROJECT_REF}" || "${PROJECT_REF}" == "${VITE_SUPABASE_URL}" ]]; then
  echo "Failed to parse Supabase project ref from VITE_SUPABASE_URL."
  echo "Expected: https://<project-ref>.supabase.co"
  exit 1
fi

DB_PASSWORD="${SUPABASE_DB_PASSWORD:-${1:-}}"
if [[ -z "${DB_PASSWORD}" && -t 0 ]]; then
  read -r -s -p "Supabase DB password: " DB_PASSWORD
  echo
fi
if [[ -z "${DB_PASSWORD}" ]]; then
  echo "Missing DB password."
  echo "Set SUPABASE_DB_PASSWORD (or pass it as the first argument) then rerun."
  echo "You can find it in Supabase Dashboard → Project Settings → Database."
  exit 1
fi

if ! supabase projects list >/dev/null 2>&1; then
  echo "Supabase CLI is not logged in (or cannot reach Supabase)."
  echo "Run: supabase login"
  exit 1
fi

echo "Linking to Supabase project: ${PROJECT_REF}"
supabase link --project-ref "${PROJECT_REF}" --password "${DB_PASSWORD}" --yes

echo "Pushing migrations in supabase/migrations/..."
supabase db push --password "${DB_PASSWORD}" --yes

echo "Done."
