#!/bin/sh
set -eu
mkdir -p outbound
printf '%s\n' '{"agent":"sheets-to-database-steward","mode":"draft_only_until_confirmed","followup_message":"Preflight complete. Scheduled runs are read-only; consequential actions require later-turn confirmation."}'
