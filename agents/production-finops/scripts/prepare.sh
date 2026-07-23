#!/bin/sh
set -eu

TOOLS_DIR="${HOME}/.cache/aleph-production-finops"
MARKER_FILE="${TOOLS_DIR}/prepared"

if [ -f "${MARKER_FILE}" ]; then
  printf '%s\n' 'session_start: production-finops tooling already prepared in this sandbox'
  exit 0
fi

mkdir -p "${TOOLS_DIR}"

install_npm_cli() {
  package_name="$1"
  binary_name="$2"
  if command -v "${binary_name}" >/dev/null 2>&1; then
    return
  fi
  npm install --global --no-audit --no-fund "${package_name}"
}

# These packages only add client tooling. The agent rules still prohibit all
# state-changing commands, and provider tokens must be read-only.
install_npm_cli @upstash/cli upstash

touch "${MARKER_FILE}"
printf '%s\n' 'session_start: production-finops read-only reporting CLIs prepared'
