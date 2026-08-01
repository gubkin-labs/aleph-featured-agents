# Roadmap Consistency Checker

## Outcome

Find contradictory roadmap status, ownership, and dates across planning systems.

## Required Connections

- `productboard`
- `linear`
- `notion`

## Trigger mode

chat + scheduled polling. Connected-app events are checked on demand or by polling; this is not a real-time webhook automation.

## Schedule

`0 8 * * 1` in UTC. Scheduled runs are read-only and produce reports or drafts only. Change or remove the schedule after cloning as needed.

## Setup after cloning

1. Connect the required apps on the Connections page.
2. Tell the agent which workspaces, projects, folders, channels, or accounts are in scope.
3. Add preferences, thresholds, exclusions, and policy rules in chat; the agent stores them in private memory.
4. Optionally connect Discord or Telegram and choose a Schedule channel.
5. Run once manually and inspect the report before enabling the schedule.

## Data written

The agent writes private cursor/profile/pending-action memory and may create report or preview files under `outbound/`. It does not write to connected apps during scheduled runs.

## Actions requiring confirmation

All sends, posts, record creation or edits, merges, deletes, permission changes, financial actions, and database writes require an exact preview and explicit confirmation in a later chat turn.

## Vault variables

None by default. Authentication uses Aleph Connections. User-specific IDs and thresholds should normally be provided in chat and kept in memory, not stored as secrets.

## Three-minute demo

1. Clone the agent and connect productboard, linear, notion.
2. Say: “Analyze a small recent sample, explain the top three findings, and prepare one action preview. Do not execute it.”
3. Inspect the cited evidence, `outbound/` artifact, and pending action. Reject it or explicitly approve its action ID to test the two-turn safety boundary.

## Aleph primitives

- Connections
- schedules
- skills
- scripts
- hooks
- memory
- outbound files
