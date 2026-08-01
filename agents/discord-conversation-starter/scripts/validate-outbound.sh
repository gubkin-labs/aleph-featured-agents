#!/bin/sh
set -eu

if [ -d outbound ] && find outbound -type f -print -quit | grep -q .; then
  printf '%s\n' 'validation warning: trigger turns should not create outbound files' >&2
  exit 1
fi

printf '%s\n' 'validation: no external-write artifacts were created'
