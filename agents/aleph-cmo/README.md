# Aleph CMO

**Who it is for:** Aleph operators who want a cautious, research-led editorial
partner for the public blog.

**What it does:** Once daily, it studies the Aleph product context, existing
blog posts, and relevant AI/agent-market developments. It opens at most one
Markdown blog-post pull request when it finds a differentiated, evidence-backed
topic worth publishing. The PR always needs human review and is never merged or
deployed by the agent.

## After cloning

1. Keep the synced agent private and enable it in the intended scope.
2. Add a least-privilege `GH_TOKEN` to the clone's vault scope. The
   featured-agent sync workflow can provision the source agent's value from its
   `ALEPH_REPOS_TOKEN` GitHub Actions secret, but Aleph never copies secrets
   into clones. It needs read access to `gubkin-labs/project10` and
   contents/pull-request write access only to `gubkin-labs/project10-frontend`.
3. Review the first scheduled report and every resulting PR. Add approved ICP,
   positioning, and proof-point details through chat; the agent records them in
   its memory for later research.
4. Optionally connect a private Discord Schedule channel for its daily report.

## Limits

Vercel Web Analytics is intentionally not integrated in this version. The agent
calls out that data gap and never fabricates traffic, conversion, or post-impact
metrics. It may edit only `content/blog/*.md` in its own branch, opens no more
than one PR per day, and never merges, deploys, changes configuration, or edits
application code.
