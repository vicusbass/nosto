#!/usr/bin/env bash
# Checks the agent-facing behaviour of a deployed site: Markdown negotiation on
# the homepage, the Markdown 404 and llms.txt. Only a real Vercel deployment can
# answer these: `astro dev` and `astro preview` don't apply the routes in
# .vercel/output/config.json.
#
#   scripts/agent-smoke.sh https://www.nosto.ro
#
# For a protected preview deployment, set VERCEL_AUTOMATION_BYPASS_SECRET
# (Vercel project -> Settings -> Deployment Protection -> Protection Bypass for
# Automation).

set -euo pipefail

BASE="${1:?usage: agent-smoke.sh <base-url>}"
BASE="${BASE%/}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# No -L: curl would resend the bypass header to every host a redirect points
# at. Pass the final URL (https://www.nosto.ro, not the apex that 308s to it).
CURL=(curl -sS --proto =https --max-time 30)
if [[ -n "${VERCEL_AUTOMATION_BYPASS_SECRET:-}" ]]; then
  CURL+=(-H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET")
fi

failures=0

# check <name> <path> <accept> <status> <content-type prefix> <body regex> <want Vary: Accept>
check() {
  local name="$1" path="$2" accept="$3" want_status="$4" want_type="$5" want_body="$6" want_vary="$7"
  local meta status type vary problems=()
  meta="$("${CURL[@]}" -H "Accept: $accept" -o "$WORK/body" \
    -w '%{http_code}\n%header{content-type}\n%header{vary}' "$BASE$path")"
  status="$(sed -n 1p <<<"$meta")"
  type="$(sed -n 2p <<<"$meta")"
  vary="$(sed -n 3p <<<"$meta")"

  [[ "$status" == "$want_status" ]] || problems+=("status $status, want $want_status")
  [[ "$type" == "$want_type"* ]] || problems+=("content-type '$type', want '$want_type'")
  if [[ "$want_vary" == yes ]] && ! grep -qi '\baccept\b' <<<"$vary"; then
    problems+=("vary '$vary' lacks Accept")
  fi
  grep -qE "$want_body" "$WORK/body" || problems+=("body does not match /$want_body/")

  if ((${#problems[@]})); then
    failures=$((failures + 1))
    printf 'FAIL %s (%s)\n' "$name" "$(IFS=';'; echo "${problems[*]}")"
  else
    printf 'ok   %s\n' "$name"
  fi
}

MISSING="/__agent-smoke-404-$RANDOM$RANDOM"

check 'homepage as Markdown' / 'text/markdown' 200 'text/markdown' '^# Nosto' yes
check 'homepage as HTML' / 'text/html' 200 'text/html' '<h1[ >]' yes
check 'homepage, browser Accept' / 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' 200 'text/html' '<h1[ >]' yes
check 'homepage, Markdown refused' / 'text/markdown;q=0, text/html' 200 'text/html' '<h1[ >]' yes
check '404 as Markdown' "$MISSING" 'text/markdown' 404 'text/markdown' 'llms\.txt' yes
check '404 as HTML' "$MISSING" 'text/html' 404 'text/html' 'Pagina nu a fost găsită' yes
check 'llms.txt' /llms.txt '*/*' 200 'text/plain; charset=utf-8' '^## When to use' no
check 'index.md' /index.md '*/*' 200 'text/markdown' '^# Nosto' no

if ((failures)); then
  echo "$failures check(s) failed against $BASE"
  exit 1
fi
echo "All agent checks passed against $BASE"
