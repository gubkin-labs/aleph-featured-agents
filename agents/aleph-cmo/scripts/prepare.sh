#!/bin/sh
set -eu

workspace="${HOME}/aleph-cmo-workspace"
mkdir -p "$workspace"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI is unavailable; install gh in the sandbox image before running this agent."
  exit 0
fi

for repository in project10 project10-frontend; do
  target="$workspace/$repository"
  if [ -d "$target/.git" ]; then
    git -C "$target" fetch --quiet origin
  else
    gh repo clone "gubkin-labs/$repository" "$target" -- --depth 1
  fi
done

printf '%s\n' "Prepared $workspace/project10 and $workspace/project10-frontend."
