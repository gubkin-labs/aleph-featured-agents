#!/bin/sh
set -eu

test -f AGENTS.md
test -f prompts/respond-to-discord-message.md
printf '%s\n' 'preflight: Discord trigger prompt and operating rules are ready'
