# Featured agents catalog

This repository contains five established showcase/operational agents plus the 50 clone-ready business agents below. New catalog agents use chat and scheduled polling; they do not claim real-time connected-app triggers.

## Safety contract

All generated business agents may read, research, classify, and draft automatically. Scheduled runs are read-only. Consequential writes require an exact persisted preview and explicit confirmation in a later user-authored chat turn.

## Business catalog

| Wave | Agent | Department | Required Connections | Trigger | Setup |
|---:|---|---|---|---|---|
| 1 | [Inbox Action Router](agents/inbox-action-router/README.md) | Operations | `gmail`, `linear`, `slack` | chat + scheduled polling | guided |
| 1 | [Meeting Follow-up Chief](agents/meeting-follow-up-chief/README.md) | Operations | `fathom`, `notion`, `gmail` | chat + scheduled polling | guided |
| 1 | [Support Escalation Manager](agents/support-escalation-manager/README.md) | Support | `intercom`, `linear`, `slack` | chat + scheduled polling | guided |
| 1 | [Voice of Customer Analyst](agents/voice-of-customer-analyst/README.md) | Product | `intercom`, `gorgias`, `notion` | chat + scheduled polling | guided |
| 1 | [GitHub Issue Commander](agents/github-issue-commander/README.md) | Engineering | `github`, `linear`, `slack` | chat + scheduled polling | guided |
| 1 | [Release Communications Agent](agents/release-communications-agent/README.md) | Engineering | `github`, `notion`, `slack` | chat + scheduled polling | guided |
| 1 | [Incident Scribe](agents/incident-scribe/README.md) | Engineering | `sentry`, `pagerduty`, `notion` | chat + scheduled polling | guided |
| 1 | [Lead Research Copilot](agents/lead-research-copilot/README.md) | Sales | `hubspot`, `attio`, `gmail` | chat + scheduled polling | guided |
| 1 | [Pipeline Hygiene Agent](agents/pipeline-hygiene-agent/README.md) | Sales | `hubspot`, `salesforce` | chat + scheduled polling | medium |
| 1 | [Content Repurposing Studio](agents/content-repurposing-studio/README.md) | Marketing | `googledocs`, `notion`, `linkedin` | chat + scheduled polling | guided |
| 1 | [Marketing Performance Analyst](agents/marketing-performance-analyst/README.md) | Marketing | `google_analytics`, `google_search_console`, `googlesheets` | chat + scheduled polling | guided |
| 1 | [Finance Close Assistant](agents/finance-close-assistant/README.md) | Finance | `stripe`, `quickbooks`, `googlesheets` | chat + scheduled polling | guided |
| 1 | [Subscription Revenue Watcher](agents/subscription-revenue-watcher/README.md) | Finance | `stripe` | chat + scheduled polling | low |
| 1 | [Hiring Review Assistant](agents/hiring-review-assistant/README.md) | People | `greenhouse`, `googledocs`, `slack` | chat + scheduled polling | guided |
| 1 | [Executive Daily Brief](agents/executive-daily-brief/README.md) | Leadership | `gmail`, `googlecalendar`, `slack` | chat + scheduled polling | guided |
| 2 | [Renewal Risk Monitor](agents/renewal-risk-monitor/README.md) | Customer Success | `salesforce`, `hubspot` | chat + scheduled polling | medium |
| 2 | [Sales Call Coach](agents/sales-call-coach/README.md) | Sales | `gong`, `fathom`, `hubspot` | chat + scheduled polling | guided |
| 2 | [RFP Response Builder](agents/rfp-response-builder/README.md) | Sales | `googledrive`, `box`, `googledocs` | chat + scheduled polling | guided |
| 2 | [CRM Deduplication Planner](agents/crm-deduplication-planner/README.md) | Sales | `hubspot`, `attio` | chat + scheduled polling | medium |
| 2 | [Account Handoff Agent](agents/account-handoff-agent/README.md) | Customer Success | `hubspot`, `notion`, `slack` | chat + scheduled polling | guided |
| 2 | [Customer Health Reporter](agents/customer-health-reporter/README.md) | Customer Success | `intercom`, `salesforce`, `notion` | chat + scheduled polling | guided |
| 2 | [Support Knowledge Curator](agents/support-knowledge-curator/README.md) | Support | `zendesk`, `intercom`, `notion` | chat + scheduled polling | guided |
| 2 | [Review Response Desk](agents/review-response-desk/README.md) | Support | `facebook`, `instagram` | chat + scheduled polling | medium |
| 2 | [Campaign Launch Coordinator](agents/campaign-launch-coordinator/README.md) | Marketing | `asana`, `slack`, `mailchimp` | chat + scheduled polling | guided |
| 2 | [SEO Opportunity Scout](agents/seo-opportunity-scout/README.md) | Marketing | `google_search_console`, `google_analytics`, `googledocs` | chat + scheduled polling | guided |
| 2 | [Newsletter Editor](agents/newsletter-editor/README.md) | Marketing | `googledocs`, `notion`, `mailchimp` | chat + scheduled polling | guided |
| 2 | [Social Listening Brief](agents/social-listening-brief/README.md) | Marketing | `reddit` | chat + scheduled polling | low |
| 2 | [Creator Sponsorship Manager](agents/creator-sponsorship-manager/README.md) | Marketing | `gmail`, `googlesheets` | chat + scheduled polling | medium |
| 2 | [Event Follow-up Agent](agents/event-follow-up-agent/README.md) | Marketing | `eventbrite`, `hubspot`, `gmail` | chat + scheduled polling | guided |
| 2 | [Partner Update Composer](agents/partner-update-composer/README.md) | Partnerships | `hubspot`, `notion` | chat + scheduled polling | medium |
| 3 | [Pull Request Risk Reviewer](agents/pull-request-risk-reviewer/README.md) | Engineering | `github`, `gitlab` | chat + scheduled polling | medium |
| 3 | [Dependency Update Planner](agents/dependency-update-planner/README.md) | Engineering | `github` | chat + scheduled polling | low |
| 3 | [Bug Reproduction Assistant](agents/bug-reproduction-assistant/README.md) | Engineering | `github`, `linear` | chat + scheduled polling | medium |
| 3 | [On-call Handoff Agent](agents/on-call-handoff-agent/README.md) | Engineering | `pagerduty`, `sentry`, `slack` | chat + scheduled polling | guided |
| 3 | [Engineering Weekly Digest](agents/engineering-weekly-digest/README.md) | Engineering | `github`, `linear`, `slack` | chat + scheduled polling | guided |
| 3 | [Product Feedback Synthesizer](agents/product-feedback-synthesizer/README.md) | Product | `productboard`, `intercom`, `notion` | chat + scheduled polling | guided |
| 3 | [Roadmap Consistency Checker](agents/roadmap-consistency-checker/README.md) | Product | `productboard`, `linear`, `notion` | chat + scheduled polling | guided |
| 3 | [Spec-to-Task Planner](agents/spec-to-task-planner/README.md) | Product | `notion`, `confluence`, `linear` | chat + scheduled polling | guided |
| 3 | [Design Handoff Auditor](agents/design-handoff-auditor/README.md) | Design | `figma`, `zeplin`, `linear` | chat + scheduled polling | guided |
| 3 | [Research Repository Curator](agents/research-repository-curator/README.md) | Research | `googledrive`, `notion`, `miro` | chat + scheduled polling | guided |
| 3 | [Async Standup Manager](agents/async-standup-manager/README.md) | Operations | `slack`, `microsoft_teams`, `linear` | chat + scheduled polling | guided |
| 3 | [Meeting Load Optimizer](agents/meeting-load-optimizer/README.md) | Operations | `googlecalendar` | chat + scheduled polling | low |
| 3 | [Project Risk Radar](agents/project-risk-radar/README.md) | Operations | `asana`, `clickup`, `monday` | chat + scheduled polling | guided |
| 3 | [Knowledge Base Gardener](agents/knowledge-base-gardener/README.md) | Operations | `notion`, `confluence` | chat + scheduled polling | medium |
| 3 | [OKR Progress Narrator](agents/okr-progress-narrator/README.md) | Leadership | `googlesheets`, `notion`, `linear` | chat + scheduled polling | guided |
| 4 | [Expense Policy Reviewer](agents/expense-policy-reviewer/README.md) | Finance | `gmail`, `googledrive`, `quickbooks` | chat + scheduled polling | guided |
| 4 | [Cash-flow Briefing Agent](agents/cash-flow-briefing-agent/README.md) | Finance | `stripe`, `quickbooks` | chat + scheduled polling | medium |
| 4 | [Contract Obligation Tracker](agents/contract-obligation-tracker/README.md) | Legal Operations | `box`, `googledrive`, `notion` | chat + scheduled polling | guided |
| 4 | [Sheets-to-Database Steward](agents/sheets-to-database-steward/README.md) | Data | `googlesheets`, `supabase` | chat + scheduled polling | medium |
| 4 | [Cross-System Data Auditor](agents/cross-system-data-auditor/README.md) | Data | `googlesheets`, `hubspot`, `asana` | chat + scheduled polling | guided |

## Established agents

- [Aleph CMO](agents/aleph-cmo/README.md)
- [Long-Term Stock Finder](agents/long-term-stock-finder/README.md)
- [Production FinOps](agents/production-finops/README.md)
- [Social Media Posts Scout](agents/x-engagement-scout/README.md)
- [Weather](agents/weather/README.md)

## Bundle contract

Every business catalog folder is standalone and includes catalog metadata, a cover asset, runtime instructions, Connections, schedules, lifecycle hooks, deterministic scripts, and an Agent Skill. Run `pnpm generate` after editing `catalog/agents.mjs`, then `pnpm quality`.

Connected-app event triggers are a separate Aleph platform initiative. Until that ships, descriptions and schedules must say “scheduled polling” or “on demand,” never “real time.”
