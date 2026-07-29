# Aleph featured agents

Public agent sources for [Aleph](https://www.aleph-agent.com). Each folder under `agents/` is an Aleph agent bundle. Pushing to `main` syncs every agent to the platform (create if missing, upload a new version, leave it **disabled** for clone-first discovery).

## Quick start

1. Fork or clone this repository.
2. Create a **user** or **organization** API key in Aleph (Settings → API keys).
3. Add repository secrets:
   - `ALEPH_API_KEY` (required)
   - `ALEPH_API_URL` (optional; defaults to `https://api.aleph-agent.com`)
   - `ALEPH_REPOS_TOKEN` (required for Aleph CMO when syncing with a personal
     `ALEPH_API_KEY`; stored as the Aleph vault value named `GH_TOKEN`, without
     appearing in the bundle)
4. Add the repository variable `ALEPH_CMO_AGENT_ID` with the ID of the one
   canonical Aleph CMO agent. The workflow injects it only while syncing, so
   every run updates that agent instead of creating another one.
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
    aleph.json             # catalog manifest: name, description, labels, icon, visibility
    cover.jpg              # catalog cover (synced to agent iconUrl via jsDelivr)
    AGENTS.md …
  morning-brief/
  …
Aleph CLI                  # create → metadata/icon → upload → disable
.github/workflows/
  sync-agents.yml
CATALOG.md
```

Add a new agent by creating `agents/<name>/` with a valid Aleph bundle **plus** `aleph.json` (and usually a cover image), then push. The `agents/` folders are the source of truth: removing a previously synchronized folder archives its catalog agent. If it was already absent on Aleph, sync prints a warning and continues. See [CATALOG.md](CATALOG.md) for the ranked backlog and packaging rules.

## Agent bundle checklist

Every agent folder must include:

| Path | Role |
|------|------|
| `aleph.json` | Sync catalog manifest: `name`, `description`, optional `labels`, `icon` / `iconUrl` |
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
  "name": "Weather",
  "description": "Current conditions and short forecasts via Open-Meteo.",
  "labels": ["Lifestyle", "Research"],
  "icon": "cover.jpg",
  "visibility": "public"
}
```

- `icon` — relative image file inside the agent folder (excluded from the runtime bundle upload); prefer a 16:9 photo (~1600×900)
- `iconUrl` — optional absolute URL override (skips GitHub/jsDelivr resolution)
- `labels` — optional array of up to three unique marketplace categories: `Marketing`, `Production`, `FinOps`, `Engineering`, `Sales`, `Research`, `Lifestyle`, `Productivity`, or `Trading`
- `visibility` — optional `public` (default) or `private`; private agents are not listed in the public catalog
- Sync pins icons to `GITHUB_SHA` in CI (`https://cdn.jsdelivr.net/gh/gubkin-labs/aleph-featured-agents@<sha>/agents/...`)
- Synced agents stay **disabled** — users clone from the catalog, then enable in their workspace

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
| `x-engagement-scout` | Three timely X conversations + thoughtful reply drafts every four hours |

All prefer **zero vault secrets**; connect Discord/Telegram from the Aleph Channels page after clone.

## Cache

Local sync writes `.aleph/state.json` (gitignored) so bundle paths map to agent
IDs per API origin. Add the returned `agentId` to each `aleph.json` when CI
needs identity without persisted state; the CLI never guesses by display name.
The featured workflow requires `ALEPH_CMO_AGENT_ID` for its private Aleph CMO
source agent and saves cache state even when a later bundle fails.
