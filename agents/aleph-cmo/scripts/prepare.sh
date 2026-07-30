#!/bin/sh
set -eu

workspace="${ALEPH_CMO_WORKSPACE:-${HOME}/aleph-cmo-workspace}"
mkdir -p "$workspace"
: "${GH_TOKEN:?GH_TOKEN is required to prepare the private Aleph repositories}"

for command_name in git node curl; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf '%s\n' "Required command is unavailable: $command_name" >&2
    exit 1
  fi
done

export GIT_TERMINAL_PROMPT=0
credential_helper='!f() { echo username=x-access-token; echo password=$GH_TOKEN; }; f'

for repository in project10 project10-frontend; do
  target="$workspace/$repository"
  if [ -d "$target/.git" ]; then
    git -C "$target" -c credential.helper= \
      -c credential.helper="$credential_helper" \
      fetch --quiet origin
  else
    git -c credential.helper= -c credential.helper="$credential_helper" \
      clone --quiet --depth 1 \
      "https://github.com/gubkin-labs/$repository.git" "$target"
  fi
done

printf '%s\n' "Prepared $workspace/project10 and $workspace/project10-frontend."
printf '%s\n' "Runtime tools: $(git --version); node $(node --version); curl $(curl --version | node -e 'process.stdin.once(\"data\", value => process.stdout.write(value.toString().split(\"\\n\")[0]))')"
