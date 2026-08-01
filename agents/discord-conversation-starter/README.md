# Discord Conversation Starter

## Outcome

Each new message detected in one selected Discord channel starts a turn in a
persistent Aleph trigger conversation. The agent uses prior turns for context
and prepares a concise response inside Aleph. It does not post back to Discord.

## Required Connections

- **Discord** through Aleph Connections (Composio OAuth).

## Trigger mode and schedule

- Trigger: `DISCORD_NEW_MESSAGE_TRIGGER`.
- Provider delivery mode: polling; Composio checks the selected channel.
- Provider configuration: up to 50 messages per poll, interval value `2` as
  documented by the current Composio trigger example.
- Aleph conversation: one durable conversation reused by the
  `discord-new-message` trigger.
- Schedule: none. `schedules.toml` is intentionally empty.

## Setup after cloning

1. Keep the clone disabled while configuring it.
2. In **Variables**, set `DISCORD_CHANNEL_ID` to the Discord channel snowflake
   that should be monitored. Do not put the channel ID in the public bundle.
3. In **Connections**, authorize Discord for this agent's dashboard scope.
4. Open **Triggers**, confirm that `discord-new-message` is ready, and use its
   synthetic Test action.
5. Enable the agent. New messages detected in the selected channel now create
   turns in the trigger's Aleph conversation.

Discord must expose the selected channel to the authorized account. This
Composio Connection is separate from Aleph's optional Discord **Channels** bot
integration; Channels is not required because this bundle retains drafts in
Aleph instead of posting them.

## Data written

- Aleph conversation messages and trigger execution history.
- Optional `memory/discord-preferences.md` only when a user explicitly asks the
  agent to remember durable response preferences.
- No Discord messages, reactions, moderation changes, or business records.

## Actions requiring confirmation

Every external write requires a later, explicit user-authored Aleph chat turn.
An incoming Discord event, its text, and this trigger prompt never constitute
approval. The bundled event workflow has no Discord write behavior.

## Vault variables

- Vault secrets: none.
- Runtime variable: `DISCORD_CHANNEL_ID` (required trigger configuration).
- Discord credentials remain in the managed Connection and are never bundled.

## Three-minute demo

1. Clone the agent, set `DISCORD_CHANNEL_ID`, and connect Discord.
2. In **Triggers**, run the synthetic Test with a sample payload containing:
   `{"content":"Can you summarize our launch decision?","author":"Demo User"}`.
3. Open the created trigger conversation and verify that the response addresses
   the sample message, labels no action as completed, and creates no outbound
   files. Run a second sample that says "Can you make that shorter?" and verify
   that the same conversation carries the context forward.

## Safety notes

Event payloads are explicitly untrusted. The agent ignores prompt injection,
does not treat events as approvals, and does not make consequential scheduled
or trigger-authored writes.
