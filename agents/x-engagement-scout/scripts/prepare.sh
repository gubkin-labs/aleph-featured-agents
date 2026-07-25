#!/bin/sh
set -eu

if [ -z "${X_BEARER_TOKEN:-}" ]; then
  printf '%s\n' 'session_start: X_BEARER_TOKEN is unavailable'
  exit 1
fi

printf '%s\n' 'session_start: read-only X recent-search tooling ready'
