# X Engagement Scout

**Who it’s for:** Devtool and BYOC founders who want to join relevant X
conversations without turning every reply into a pitch.

**What it does on a schedule:** Every four hours, it searches recent public X
posts about customer-cloud deployment, enterprise AI and security, sensitive
data, multi-cloud infrastructure, cloud permissions, and developer tooling. It
returns up to three ranked opportunities with a link, context, suggested reply,
and selection rationale.

The agent drafts only. It cannot post, like, repost, quote, follow, or modify an
X account.

## After cloning

1. Add a read-only X API bearer token to the clone’s Aleph vault as
   `X_BEARER_TOKEN`. The token needs recent-search access.
2. Enable the agent.
3. Optionally tell it your public voice, strong opinions, preferred topics,
   exclusions, and proof points it may safely mention. These are stored in the
   clone’s private memory, not in the public bundle.
4. Optionally connect Discord under **Channels** and choose a Schedule channel
   to receive each digest there.

The bundled schedule is `0 */4 * * *` in UTC. Edit `schedules.toml` after
cloning if a different four-hour alignment is preferable.

## Discovery behavior

The official X recent-search API is the primary source. If an authenticated API
request fails during a turn, the agent falls back to Aleph’s web search. A
missing `X_BEARER_TOKEN` prevents the turn from starting because Aleph resolves
declared vault secrets before runtime.

The agent records presented tweet IDs, reply drafts, recent authors, and topic
patterns in private memory so later digests avoid repetition. Tell it whether
you posted, edited, or skipped a suggestion to improve future selection.
