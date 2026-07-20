# Aleph featured agents

Public agent sources for [Aleph](https://www.aleph-agent.com). Each folder under `agents/` is an Aleph agent bundle. Pushing to `main` syncs every agent to the platform (create if missing, upload a new version, leave it **disabled** for clone-first discovery).

## Quick start

1. Fork or clone this repository.
2. Create a **user** or **organization** API key in Aleph (Settings → API keys).
3. Add repository secrets:
   - `ALEPH_API_KEY` (required)
   - `ALEPH_API_URL` (optional; defaults to `https://api.aleph-agent.com`)
4. Push to `main`, or run the **Sync agents to Aleph** workflow manually.

### Local sync

```bash
cp .env.example .env
# set ALEPH_API_KEY (and optional ALEPH_API_URL)
pnpm install
pnpm run sync
```

User API keys publish personal agents. Organization API keys publish agents into that organization. Agents from this repo are created with `visibility: public`.

## Repository layout

```text
agents/
  weather/
    aleph.json             # catalog manifest: name, description, icon
    cover.jpg              # catalog cover (synced to agent iconUrl via jsDelivr)
    AGENTS.md …
  morning-brief/
  …
scripts/
  sync-agents.ts           # create → metadata/icon → upload → disable
.github/workflows/
  sync-agents.yml
CATALOG.md
```

Add a new agent by creating `agents/<name>/` with a valid Aleph bundle **plus** `aleph.json` (and usually a cover image), then push. See [CATALOG.md](CATALOG.md) for the ranked backlog and packaging rules.

## Agent bundle checklist

Every agent folder must include:

| Path | Role |
|------|------|
| `aleph.json` | Sync catalog manifest: `name`, `description`, optional `icon` / `iconUrl` |
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
  "icon": "cover.jpg"
}
```

- `icon` — relative image file inside the agent folder (excluded from the runtime bundle upload); prefer a 16:9 photo (~1600×900)
- `iconUrl` — optional absolute URL override (skips GitHub/jsDelivr resolution)
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

All prefer **zero vault secrets**; connect Discord/Telegram from the Aleph Channels page after clone.

## Cache

Local sync writes `.aleph/agents.json` (gitignored) so folder names map to agent IDs across runs. CI recreates the mapping by listing agents and matching names when the cache is empty.
