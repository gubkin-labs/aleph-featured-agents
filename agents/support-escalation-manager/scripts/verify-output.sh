#!/bin/sh
set -eu
if find outbound -type f -size +5M -print 2>/dev/null | grep -q .; then
  printf '%s\n' '{"followup_message":"An outbound artifact exceeds 5 MB. Summarize or split it before presenting it."}'
else
  printf '%s\n' '{}'
fi
