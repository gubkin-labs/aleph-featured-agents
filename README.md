# Aleph featured agents

Public agent sources for [Aleph](https://www.aleph-agent.com). Each folder under `agents/` is an Aleph agent bundle. Pushing to `main` syncs every agent to the platform (create if missing, upload a new version, leave it **disabled** for clone-first discovery).

## Quick start

1. Fork or clone this repository.
2. Create a **user** or **organization** API key in Aleph (Settings → API keys).
3. Add repository secrets:
   - `ALEPH_API_KEY` (required)
   - `ALEPH_API_URL` (optional; defaults to `https://api.aleph-agent.com`)
   - `ALEPH_REPOS_TOKEN` (required for Aleph CMO; stored in the
     featured-agent organization Vault as the
     Aleph vault value named `GH_TOKEN`, without appearing in the bundle)
   - The workflow addresses that Vault by its stable organization slug,
     `aleph-featured-agents-org`.
4. Give every `aleph.json` a permanent UUID `agentId`. The manifest is the
   source of truth: first sync creates that exact ID and later runs update it.
   After the first successful sync, `versionId` is stamped automatically; keep
   it in Git so later syncs are not blocked by the version gate.
5. Push to `main`, or run the **Sync agents to Aleph** workflow manually.

### Local sync

```bash
cp .env.example .env
# set ALEPH_API_KEY (and optional ALEPH_API_URL)
pnpm install
pnpm run sync
```

User API keys publish personal agents. Organization API keys publish agents into that organization. Agents from this repo are created with `visibility: public` by default. Set `"visibility": "private"` in an individual `aleph.json` for an operational template whose source stays public but whose synced Aleph agent is private.

## Repository layout

```text
agents/
  weather/
    aleph.json             # identity + catalog metadata
    cover.jpg              # catalog cover (synced to agent iconUrl via jsDelivr)
    AGENTS.md …
  morning-brief/
  …
Aleph CLI                  # create → metadata/icon → upload → disable
.github/workflows/
  sync-agents.yml
CATALOG.md
```

Add a new agent by creating `agents/<name>/` with a valid Aleph bundle **plus**
`aleph.json` (and usually a cover image), then push. `agentId` is required; if
it is missing, the CLI prints a generated UUID and the exact field to add.
The `agents/` folders are the source of truth: removing a previously
synchronized folder archives its catalog agent. If it was already absent on
Aleph, sync prints a warning and continues. See [CATALOG.md](CATALOG.md) for
the ranked backlog and packaging rules.

## Agent bundle checklist

Every agent folder must include:

| Path | Role |
|------|------|
| `aleph.json` | Sync catalog manifest: `name`, `description`, optional `labels`, `icon` / `iconUrl`, stamped `versionId` |
| `AGENTS.md` | Agent identity, tone, and operating rules |
| `README.md` | Human-facing documentation |
| `sandbox.toml` | Runtime settings |
| `hooks.toml` | `sessionStart` / `sessionEnd` hooks |
| `schedules.toml` | Cron schedules (minimum interval: 1 hour) |
| `skills/` | Optional [Agent Skills](https://agentskills.io) |
| `cover.jpg` (or path in `aleph.json`) | Catalog cover photo; sync sets `agents.iconUrl` via jsDelivr |

### `aleph.json` example

```json
{
  "agentId": "5c5b86cf-b0d6-4e30-a9a0-58292e3afd59",
  "name": "Weather",
  "description": "Current conditions and short forecasts via Open-Meteo.",
  "labels": ["Lifestyle", "Research"],
  "icon": "cover.jpg",
  "visibility": "public",
  "versionId": "7fc4635d-a139-409b-9808-179ecf589493"
}
```

- `agentId` — required permanent UUID; sync creates or updates this exact agent and never falls back to display-name matching
- `versionId` — optional until first sync, then required for existing remotes; stamped by push/sync/pull and excluded from change detection
- `icon` — relative image file inside the agent folder (excluded from the runtime bundle upload); prefer a 16:9 photo (~1600×900)
- `iconUrl` — optional absolute URL override (skips GitHub/jsDelivr resolution)
- `labels` — optional array of up to three unique marketplace categories: `Marketing`, `Production`, `FinOps`, `Engineering`, `Sales`, `Research`, `Lifestyle`, `Productivity`, or `Trading`
- `visibility` — optional `public` (default) or `private`; private agents are not listed in the public catalog
- Sync pins icons to `GITHUB_SHA` in CI (`https://cdn.jsdelivr.net/gh/gubkin-labs/aleph-featured-agents@<sha>/agents/...`)
- Synced agents stay **disabled** — users clone from the catalog, then enable in their workspace
- An identical runtime bundle and identical `aleph.json` metadata reuse the
  latest version. Changing manifest metadata creates a version even when runtime
  files are unchanged; changing only `agentId` or `versionId` does not

Do **not** include `memory/`, `conversations/`, root platform `manifest.json`, or `.agents/` — those paths are reserved by Aleph. Use **`aleph.json`** for catalog metadata instead (it is sync-only and never uploaded as a version file).

Channels (Discord / Telegram) are **not** bundle files. Connect them in the Aleph UI under **Channels** after you clone and enable an agent.

## Featured agents (wave 1)

| Folder | One-line promise |
|--------|------------------|
| `weather` | Current conditions via Open-Meteo (skill showcase) |
| `morning-brief` | Daily weather + headlines + focus note |
| `habit-coach` | Morning/evening habit check-ins with streaks |
| `community-moderator` | Mod drafts + daily norms digest for communities |
| `support-triage` | Categorize customer messages and draft replies |
| `team-standup` | Weekday async standup prompt + afternoon digest |
| `x-engagement-scout` | Recent audience-side X posts + thoughtful reply drafts every four hours |

All prefer **zero vault secrets**; connect Discord/Telegram from the Aleph Channels page after clone.

## Cache

Every manifest owns its agent identity. Local sync writes `.aleph/state.json`
(gitignored) only so a later sync can archive an agent when its bundle folder
is removed. Cache loss cannot change, discover, or replace an agent ID.
