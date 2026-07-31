#!/bin/sh
set -eu

workspace="${ALEPH_CMO_WORKSPACE:-${HOME}/aleph-cmo-workspace}"
mkdir -p "$workspace/drafts"

if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' "Required command is unavailable: node" >&2
  exit 1
fi

printf '%s\n' "Aleph CMO runtime ready (node $(node --version))."
printf '%s\n' "Use Connections GitHub tools for repository reads, writes, and pull requests."
printf '%s\n' "Write draft blog Markdown under $workspace/drafts before validate-blog.sh."
