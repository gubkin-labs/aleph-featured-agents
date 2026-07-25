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

1. Enable the agent. No API key or paid X developer account is required.
2. Optionally tell it your public voice, strong opinions, preferred topics,
   exclusions, and proof points it may safely mention. These are stored in the
   clone’s private memory, not in the public bundle.
3. Optionally connect Discord under **Channels** and choose a Schedule channel
   to receive each digest there.

The bundled schedule is `0 */4 * * *` in UTC. Edit `schedules.toml` after
cloning if a different four-hour alignment is preferable.

## Discovery behavior

The agent uses Aleph’s built-in web search with several narrow topic queries
aimed at canonical public X post links. Search-engine indexing can lag or omit
posts, so the agent verifies available context and returns fewer than three
rather than padding a digest with weak or unverifiable suggestions.
Scheduled research is capped at five searches and may return one or two strong
opportunities instead of timing out while trying to fill three slots. It does
not narrate intermediate research progress on scheduled runs.

The agent records presented tweet IDs, reply drafts, recent authors, and topic
patterns in private memory so later digests avoid repetition. Tell it whether
you posted, edited, or skipped a suggestion to improve future selection.
