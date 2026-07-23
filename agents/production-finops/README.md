# Production FinOps

**Who it is for:** Aleph operators who need a read-only view of production
infrastructure cost and usage.

**What it does:** Every four hours it looks for billing and usage anomalies across
Vercel, Neon, and Upstash. Once a day it produces a provider and service
breakdown.

## Set up after sync

1. Keep the synced agent private and enable it only in the intended personal or
   organization scope.
2. Connect the Vercel and Neon MCP servers from the agent settings page. Add
   only `UPSTASH_EMAIL` and `UPSTASH_TOKEN` to that scope's vault.
3. Ensure each token is restricted to read-only billing, usage, analytics, and
   resource-list permissions. Do not grant deployment, database, cache, storage,
   or account-management write permissions.
4. Enable the agent, review the first report for account/project mapping, and
   optionally connect a private delivery channel in the Channels UI.

## Schedules

- `0 */4 * * *` — four-hour anomaly report
- `15 0 * * *` — daily detailed report (UTC by default)

The daily report is intentionally delayed fifteen minutes after midnight UTC to
reduce partial-day aggregation issues. Provider billing data can still lag; the
agent labels incomplete or estimated values.

## Snapshot behavior

The prepare hook avoids reinstalling a CLI when it is already present in the
current sandbox filesystem. It cannot itself create or select a Vercel Sandbox
snapshot. The Aleph runtime currently decides sandbox lifecycle, so repeated
installs will continue until that runtime launches this agent from a prepared
snapshot or preserves a sandbox filesystem between turns.

No secrets or OAuth tokens are committed to this bundle.
