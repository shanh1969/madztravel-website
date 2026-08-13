#!/usr/bin/env bash
# ============================================================
# madztravel.ca on/off switch — brand-registration hold.
#
#   scripts/site-switch.sh status
#   scripts/site-switch.sh off [--black]
#   scripts/site-switch.sh on
#
# WHY THIS IS A GIT COMMIT AND NOT A `vercel deploy`
# The live project (madztravel-website, prj_n8wadkqpC1M2D9r92DZx8YMToQpn)
# auto-deploys from GitHub main. A CLI deploy would be silently reverted by
# the next push, so the hold has to live in main itself. Push and Vercel does
# the rest; "on" is a plain git revert, which restores the site byte-for-byte.
#
# WHAT IT DOES NOT TOUCH
#   * madz-test.vercel.app — no git link, hand-deployed, stays live for testing.
#   * googledfbf834d291411dc.html — Search Console verification. Overwriting it
#     loses verification, so it is excluded from the hold.
#   * smarterflow.ca/travel/madztravel — a different project entirely. That page
#     is gated by the travelAgencies slug, not by this repo.
#
# The hold pages carry TravelOnly's name, address and TICO Reg. #4316071, which
# is what Madeleine is entitled to advertise under before the brand is approved.
# --black serves a blank black page instead, advertising nothing at all.
# ============================================================

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO"

MARKER="SITE-HOLD-ACTIVE"
TRAILER="Site-Hold: on"

# Every public page. The Google verification file is deliberately absent.
PAGES=(
  index.html
  about.html
  cruises.html
  group-travel.html
  privacy.html
  terms.html
  vacation-packages.html
  whitby-travel-advisor.html
  blog/index.html
  blog/best-all-inclusive-caribbean-resorts-2026.html
)

is_held() { grep -q "$MARKER" index.html 2>/dev/null; }

live_state() {
  local body
  body="$(curl -s --max-time 20 https://madztravel.ca/ || true)"
  if [ -z "$body" ]; then
    echo "unreachable"
  elif printf '%s' "$body" | grep -q "$MARKER"; then
    echo "HELD"
  else
    echo "LIVE"
  fi
}

require_clean_main() {
  local branch
  branch="$(git rev-parse --abbrev-ref HEAD)"
  [ "$branch" = "main" ] || { echo "refusing: on branch '$branch', expected main" >&2; exit 1; }
  [ -z "$(git status --porcelain)" ] || { echo "refusing: working tree is dirty — another session may be mid-edit" >&2; git status --short >&2; exit 1; }
  git fetch -q origin main
  [ "$(git rev-parse main)" = "$(git rev-parse origin/main)" ] || { echo "refusing: main and origin/main have diverged — reconcile first" >&2; exit 1; }
}

cmd_status() {
  echo "repo   : $(if is_held; then echo HELD; else echo LIVE; fi) (main @ $(git rev-parse --short HEAD))"
  echo "live   : $(live_state)  https://madztravel.ca"
  echo "test   : untouched by this script — https://madz-test.vercel.app"
  if is_held; then
    echo "hold at: $(git log -1 --format='%h %s' --grep="$TRAILER" || true)"
  fi
}

cmd_off() {
  is_held && { echo "already held — nothing to do"; exit 0; }
  require_clean_main

  local src="_hold/holding.html" label="holding page"
  if [ "${1:-}" = "--black" ]; then src="_hold/black.html"; label="blank black page"; fi

  local page
  for page in "${PAGES[@]}"; do
    [ -f "$page" ] && cp "$src" "$page"
  done
  cp _hold/robots-hold.txt robots.txt
  cp _hold/vercel-hold.json vercel.json
  [ -f sitemap.xml ] && git rm -q sitemap.xml

  git add -- "${PAGES[@]}" robots.txt vercel.json
  git commit -q -m "SITE HOLD — brand registration pending ($label)

Every public page serves the hold page; robots.txt disallows all; the sitemap
is withdrawn and the /travel and /app proxies to smarterflow.ca are removed so
no brand surface is reachable through this domain. Reverse with:
scripts/site-switch.sh on

$TRAILER"
  git push -q origin main
  echo "held. pushed $(git rev-parse --short HEAD) — Vercel is deploying $label."
}

cmd_on() {
  is_held || { echo "already live — nothing to do"; exit 0; }
  require_clean_main

  local hold_sha
  hold_sha="$(git log -1 --format=%H --grep="$TRAILER")"
  [ -n "$hold_sha" ] || { echo "refusing: index.html is held but no hold commit found — restore by hand" >&2; exit 1; }

  git revert --no-edit "$hold_sha" >/dev/null
  git push -q origin main
  echo "live. reverted ${hold_sha:0:7}, pushed $(git rev-parse --short HEAD) — Vercel is restoring the site."
}

case "${1:-status}" in
  status) cmd_status ;;
  off)    shift; cmd_off "$@" ;;
  on)     cmd_on ;;
  *)      echo "usage: scripts/site-switch.sh [status|off [--black]|on]" >&2; exit 1 ;;
esac
