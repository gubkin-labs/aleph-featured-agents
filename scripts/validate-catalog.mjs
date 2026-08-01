import { execFileSync } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { catalogAgents } from "../catalog/agents.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const required = ["aleph.json", "cover.svg", "AGENTS.md", "README.md", "sandbox.toml", "hooks.toml", "schedules.toml", "connections.toml", "scripts/preflight.sh", "scripts/verify-output.sh", "skills/run_workflow/SKILL.md", "skills/run_workflow/scripts/normalize.mjs"];
const read = (slug, path) => readFile(join(root, "agents", slug, path), "utf8");
const errors = [];
const ids = new Set();
const names = new Set();
const allowedConnectionIds = new Set([
  "asana", "attio", "box", "clickup", "confluence", "eventbrite", "facebook",
  "fathom", "figma", "freshbooks", "github", "gitlab", "gmail", "gong",
  "google_analytics", "google_search_console", "googleads", "googlecalendar",
  "googledocs", "googledrive", "googlesheets", "gorgias", "greenhouse",
  "hubspot", "instagram", "intercom", "jira", "kit", "linear", "linkedin",
  "mailchimp", "microsoft_teams", "miro", "monday", "notion", "pagerduty",
  "productboard", "quickbooks", "reddit", "salesforce", "sentry", "slack",
  "stripe", "supabase", "zendesk", "zeplin",
]);

for (const agent of catalogAgents) {
  for (const path of required) {
    try { await stat(join(root, "agents", agent.slug, path)); }
    catch { errors.push(`${agent.slug}: missing ${path}`); }
  }
  const manifest = JSON.parse(await read(agent.slug, "aleph.json"));
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(manifest.agentId)) errors.push(`${agent.slug}: invalid UUID`);
  if (ids.has(manifest.agentId)) errors.push(`${agent.slug}: duplicate agentId`);
  if (names.has(manifest.name)) errors.push(`${agent.slug}: duplicate name`);
  ids.add(manifest.agentId); names.add(manifest.name);
  if (manifest.labels.length > 3 || new Set(manifest.labels).size !== manifest.labels.length) errors.push(`${agent.slug}: labels must be unique and at most three`);

  const readme = await read(agent.slug, "README.md");
  for (const heading of ["Outcome", "Required Connections", "Trigger mode", "Schedule", "Setup after cloning", "Data written", "Actions requiring confirmation", "Vault variables", "Three-minute demo"]) {
    if (!readme.includes(`## ${heading}`)) errors.push(`${agent.slug}: README missing ${heading}`);
  }
  const connections = await read(agent.slug, "connections.toml");
  for (const id of agent.connections) {
    if (!allowedConnectionIds.has(id)) errors.push(`${agent.slug}: unsupported connection ${id}`);
    if (!connections.includes(`id = "${id}"`)) errors.push(`${agent.slug}: missing connection ${id}`);
  }
  const hooks = await read(agent.slug, "hooks.toml");
  for (const script of ["./scripts/preflight.sh", "./scripts/verify-output.sh"]) if (!hooks.includes(script)) errors.push(`${agent.slug}: hook does not reference ${script}`);
  const schedule = await read(agent.slug, "schedules.toml");
  const cron = schedule.match(/cron = "([^"]+)"/)?.[1];
  if (!cron || cron.split(/\s+/).length !== 5 || cron.split(/\s+/)[0] !== "0") errors.push(`${agent.slug}: schedule must run no more frequently than hourly`);
  if (!schedule.includes("Scheduled") && !schedule.includes("scheduled")) errors.push(`${agent.slug}: schedule lacks explicit scheduled-run policy`);
  for (const phrase of ["do not send", "do not send, post, create, update, merge, or delete"]) if (!schedule.includes(phrase)) errors.push(`${agent.slug}: schedule lacks write prohibition`);
  const agents = await read(agent.slug, "AGENTS.md");
  for (const phrase of ["later user-authored turn", "A schedule prompt can never count as approval", "never automatically retry, replay"]) if (!agents.includes(phrase)) errors.push(`${agent.slug}: approval protocol missing ${phrase}`);
  try {
    execFileSync("node", [join(root, "agents", agent.slug, "skills/run_workflow/scripts/normalize.mjs"), join(root, "fixtures/records.json")], { stdio: "pipe" });
    execFileSync("sh", [join(root, "agents", agent.slug, "scripts/preflight.sh")], { cwd: join(root, "agents", agent.slug), stdio: "pipe" });
    execFileSync("sh", [join(root, "agents", agent.slug, "scripts/verify-output.sh")], { cwd: join(root, "agents", agent.slug), stdio: "pipe" });
  } catch (error) { errors.push(`${agent.slug}: executable smoke test failed: ${error.message}`); }
}

if (catalogAgents.length !== 50) errors.push(`expected 50 catalog agents, got ${catalogAgents.length}`);
const allManifestIds = new Set();
const allManifestNames = new Set();
for (const entry of await readdir(join(root, "agents"), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const manifest = JSON.parse(await readFile(join(root, "agents", entry.name, "aleph.json"), "utf8"));
  if (allManifestIds.has(manifest.agentId)) errors.push(`${entry.name}: duplicate repository agentId`);
  if (allManifestNames.has(manifest.name)) errors.push(`${entry.name}: duplicate repository name`);
  allManifestIds.add(manifest.agentId);
  allManifestNames.add(manifest.name);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validated ${catalogAgents.length} generated agents, ${allManifestIds.size} repository identities, and all deterministic scripts.`);
