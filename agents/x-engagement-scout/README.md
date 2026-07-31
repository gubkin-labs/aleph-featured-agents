# Social Media Posts Scout

**Who it’s for:** Founders selling software that enterprises often need inside
the customer’s own cloud — people who want to join **buyer-side** X
conversations, not chase competing BYOC products.

**What it does on a schedule:** Every four hours, it searches for public X
posts from roughly the **last couple of days** where SaaS / AI / security /
data vendors describe deployment pain: VPC or customer-account installs, data
residency objections, airgapped asks, or the ops burden of maintaining
self-hosted customer deployments. It returns up to three ranked opportunities
with a link, context, suggested reply, and selection rationale.

It deliberately avoids competitor landscape threads, peer product launches, and
“BYOC tools” style queries.

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

The agent uses Aleph’s built-in web search with several narrow audience-pain
queries aimed at canonical public X post links from the last ~48 hours.
Search-engine indexing can lag or omit posts, so the agent verifies available
context and returns fewer than three rather than padding a digest with weak,
stale, or competitor-centric suggestions. Scheduled research is capped at five
searches and may return one or two strong opportunities — or none — instead of
timing out while trying to fill three slots. It does not narrate intermediate
research progress on scheduled runs.

The agent records presented tweet IDs, reply drafts, recent authors, and topic
patterns in private memory so later digests avoid repetition. Tell it whether
you posted, edited, or skipped a suggestion to improve future selection.
