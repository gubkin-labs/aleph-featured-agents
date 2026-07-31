#!/bin/sh
set -eu

repo="${ALEPH_CMO_WORKSPACE:-${HOME}/aleph-cmo-workspace}/project10-frontend"
title="${1:?usage: open-pr.sh TITLE BODY}"
body="${2:?usage: open-pr.sh TITLE BODY}"
branch="$(git -C "$repo" branch --show-current)"

case "$branch" in
  marketing/*) ;;
  *) printf '%s\n' "Refusing to push non-marketing branch: $branch" >&2; exit 1 ;;
esac

git -C "$repo" -c credential.helper= \
  -c credential.helper='!f() { echo username=x-access-token; echo password=$GH_TOKEN; }; f' \
  push --set-upstream origin "$branch"

payload="$(node -e 'process.stdout.write(JSON.stringify({title:process.argv[1],body:process.argv[2],head:process.argv[3],base:"main"}))' "$title" "$body" "$branch")"
response="$(curl --fail-with-body --silent --show-error \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/gubkin-labs/project10-frontend/pulls \
  -d "$payload")"

node -e 'const value=JSON.parse(process.argv[1]); process.stdout.write(`${value.html_url}\n`)' "$response"
