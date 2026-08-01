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
2. Open the agent's **Connections** page and connect **GitHub** for that
   workspace scope. Authorize only `gubkin-labs/project10-frontend`; do not
   grant the connection access to other private repositories. The agent reads
   public material under `content/docs/` and `content/blog/`, and may create a
   branch/PR containing one new `content/blog/*.md` article. Do not put a
   `GH_TOKEN` in the vault.
3. Review the first scheduled report and every resulting PR. Add approved ICP,
   positioning, and proof-point details through chat; the agent records them in
   its memory for later research.
4. Optionally connect a private Discord Schedule channel for its daily report.

Unpushed drafts are checkpointed in agent memory and retried on the next run.
Files left only in the sandbox workspace are temporary and are never presented
as durable output.

## Limits

The agent has no authority to inspect private repositories, application code,
internal knowledge bases, infrastructure, or analytics systems. It never
fabricates traffic, conversion, or post-impact metrics. It may edit only
`content/blog/*.md` in its own branch, opens no more than one PR per day, and
never merges, deploys, changes configuration, or edits application code.
