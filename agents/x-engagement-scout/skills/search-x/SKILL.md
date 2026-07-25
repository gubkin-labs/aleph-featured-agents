---
name: search-x
description: Search recent public X posts through the official read-only API and return normalized candidates for engagement research.
---

# Search X

Use this skill whenever X Engagement Scout needs primary tweet discovery.

## Command

Run one focused query at a time:

```sh
node skills/search-x/scripts/search-x.mjs \
  --query '(BYOC OR "customer cloud" OR "self hosted") lang:en -is:retweet' \
  --max-results 25
```

Run multiple query families rather than one broad query. Useful families:

```text
(BYOC OR "bring your own cloud" OR "customer cloud" OR "self hosted") lang:en -is:retweet
("sensitive data" OR "private data") ("AI agent" OR "enterprise AI") lang:en -is:retweet
("security review" OR IAM OR "cloud permissions") (SaaS OR devtool OR AI) lang:en -is:retweet
("control plane" OR "data plane" OR multicloud OR "multi-cloud") (deployment OR infrastructure) lang:en -is:retweet
```

The command writes normalized JSON to stdout. Each candidate includes the post
ID, text, creation time, public metrics, author identity, and canonical X URL.

## Failure handling

If the command exits non-zero or returns `{ "ok": false }`, do not retry the
same query repeatedly. Use Aleph `web_search` with an equivalent narrow
objective and verify canonical post links before selection.

## Rules

- This skill is read-only. Do not modify it to call X write endpoints.
- Never print, quote, store, or pass `X_BEARER_TOKEN` as a command argument.
- Do not treat metrics as a proxy for relevance; use them only as supporting
  context during editorial ranking.
- Always apply memory-based deduplication after collecting results.
