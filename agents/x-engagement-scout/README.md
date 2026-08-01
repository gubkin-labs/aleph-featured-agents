# Social Media Posts Scout

**Who it’s for:** Anyone who wants a scheduled or on-demand scout for recent
public posts on X and Reddit.

**What it does:** Finds already-published posts matching a topic you give it
(or the bundled schedule topic), returns ranked links with context, and can
draft reply suggestions for human review. It cannot post, comment, like,
repost, or otherwise mutate a social account.

The bundled schedule searches every four hours for posts specifically about
**BYOC** (Bring Your Own Cloud / customer-cloud deployment). Edit
`schedules.toml` after cloning to change the topic or cadence.

## After cloning

1. Enable the agent.
2. Open **Connections** and connect **Reddit** for the agent’s dashboard scope.
   Reddit search uses that connection; X discovery uses Aleph’s built-in
   `x_search` (no X developer account required).
3. Optionally tell it your public voice, preferred topics, exclusions, and
   proof points it may safely mention. These are stored in the clone’s private
   memory, not in the public bundle.
4. Optionally connect Discord under **Channels** and choose a Schedule channel
   to receive each digest there.

## Discovery behavior

- **X:** platform `x_search` for live posts and threads.
- **Reddit:** Connections Reddit toolkit tools (for example
  `REDDIT_SEARCH_ACROSS_SUBREDDITS`), never Reddit write actions.
- Private memory tracks presented post IDs, drafts, authors, and topic patterns
  so later digests avoid repetition.

Ask in chat for any topic (for example “cool AI infra posts on Reddit”) —
the agent is not limited to the schedule’s BYOC prompt.
