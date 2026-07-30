#!/bin/sh
set -eu

workspace="${HOME}/aleph-cmo-workspace"
mkdir -p "$workspace"

for repository in project10 project10-frontend; do
  target="$workspace/$repository"
  if [ -d "$target/.git" ]; then
    git -C "$target" fetch --quiet origin
  else
    git clone --quiet --depth 1 \
      "https://github.com/gubkin-labs/$repository.git" "$target"
  fi
done

printf '%s\n' "Prepared $workspace/project10 and $workspace/project10-frontend."
