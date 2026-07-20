# Featured agents catalog

Public agents in this repo sync to Aleph as `visibility: public`.

## Shipped (wave 1)

| Folder | Audience | Promise | Aleph proof |
|--------|----------|---------|-------------|
| `weather` | Showcase | Current conditions via Open-Meteo skill | skill script + hourly schedule |
| `morning-brief` | Individuals + showcase | Daily weather + headlines + focus | schedule + memory + skill + channel |
| `habit-coach` | Individuals | Habit check-ins and streaks | schedule + memory |
| `community-moderator` | Creators | Discord/Telegram mod drafts + digest | channel-oriented + schedule + memory |
| `support-triage` | SMB / creators | Categorize tickets + draft replies | memory + schedule |
| `team-standup` | Teams | Async standup prompt + digest | schedule + channel + memory |

## Ranked backlog (wave 2+)

Build next after wave-1 clone / feedback signals. Order is deliberate:

| Rank | Agent | Audience | Why next |
|------|-------|----------|----------|
| 1 | **Content Repurposer** | Creators | High clone intent; brand-voice memory; chat-first (no integrations) |
| 2 | **Competitive Watch** | Teams | Weekly schedule + `web_search` + competitor list in memory |
| 3 | **Learning Tutor** | Individuals | Spaced quizzes on a schedule; strong retention story |
| 4 | **Newsletter Digester** | Creators / individuals | Paste → weekly “what matters” digest |
| 5 | **Review Responder** | SMB | Paste review → draft reply; brand + policy memory |
| 6 | **Travel Packer** | Individuals | Checklist + weather skill reuse |
| 7 | **Meeting Notes Cleaner** | Teams | Paste transcript → decisions / owners |
| 8 | **Decision Journal** | Individuals | Memory-heavy; weekly review schedule |
| 9 | **Launch Day Runner** | Creators | Multi-hour schedule reminders on launch day |
| 10 | **Incident Scribe** | Teams | Channel + memory during incidents |
| 11 | **Hiring Screener Draft** | Teams | Rubric memory; paste resume/JD |
| 12 | **Receipt / Expense Sorter** | Individuals | Chat paste only (no bank APIs) |
| 13 | **Memory Pet** | Showcase | Fun onboarding memory demo |
| 14 | **Echo Lab / Hook Demo** | Showcase (dev) | sessionStart/sessionEnd visibility — low consumer priority |

### Explicitly deferred

Do **not** queue for featured v1:

- Email / calendar / CRM agents (OAuth + no MCP)
- Coding agents (Cursor owns that surface)
- Generic “ChatGPT clone” personas with no schedule, skill, or channel story

## Packaging checklist

Every new `agents/<name>/` needs: `AGENTS.md`, `README.md`, `sandbox.toml`, `hooks.toml`, `schedules.toml`, and optional `skills/`. Prefer **zero vault secrets**. README pattern: who → schedule → after clone → channel tip.
