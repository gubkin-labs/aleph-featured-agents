# Production FinOps

**Who it is for:** Aleph operators who need a read-only view of production
infrastructure cost, usage, and platform demand.

**What it does:** Every four hours it looks for billing and usage anomalies across
Vercel, Neon, Upstash, and Cloudflare R2. Once a day it produces a provider and
service breakdown together with Aleph conversation, turn, and plan-limit metrics.

## Set up after sync

1. Keep the synced agent private and enable it only in the intended personal or
   organization scope.
2. Add the provider credentials and dedicated Aleph billing key to that scope's vault:
   `VERCEL_TOKEN`, `NEON_API_KEY`, `UPSTASH_EMAIL`, `UPSTASH_API_KEY`, and
   `CLOUDFLARE_API_TOKEN`, plus `ALEPH_API_KEY`.
3. Ensure each token is restricted to read-only billing, usage, analytics, and
   resource-list permissions. Do not grant deployment, database, cache, storage,
   or account-management write permissions.
4. Add runtime variable `ALEPH_API_URL` (for example,
   `https://api.aleph-agent.com`). The agent must use the billing API rather
   than direct database credentials.
5. Enable the agent, review the first report for account/project mapping, and
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

No secrets are committed to this bundle.
