import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const AGENTS_DIR = join(ROOT, "agents");
const CACHE_DIR = join(ROOT, ".aleph");
const CACHE_FILE = join(CACHE_DIR, "agents.json");

const DEFAULT_API_URL = "https://api.aleph-agent.com";

type AgentCache = Record<string, { agentId: string; organizationId: string | null }>;

type AgentSummary = {
  id: string;
  name: string;
  organizationId: string | null;
};

type AgentsPage = {
  data: AgentSummary[];
  page: number;
  pageSize: number;
  total: number;
};

type VersionRecord = {
  id: string;
};

const requireEnv = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const apiUrl = (process.env.ALEPH_API_URL?.trim() || DEFAULT_API_URL).replace(
  /\/$/,
  ""
);
const apiKey = requireEnv("ALEPH_API_KEY");

const authHeaders = (): HeadersInit => ({
  "x-api-key": apiKey,
});

const jsonHeaders = (): HeadersInit => ({
  "content-type": "application/json",
  "x-api-key": apiKey,
});

const loadCache = (): AgentCache => {
  if (!existsSync(CACHE_FILE)) {
    return {};
  }
  return JSON.parse(readFileSync(CACHE_FILE, "utf8")) as AgentCache;
};

const saveCache = (cache: AgentCache): void => {
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`);
};

const listAgentFolders = (): string[] => {
  if (!existsSync(AGENTS_DIR)) {
    throw new Error(`Missing agents directory at ${AGENTS_DIR}`);
  }

  return readdirSync(AGENTS_DIR)
    .filter((name) => {
      const full = join(AGENTS_DIR, name);
      return statSync(full).isDirectory() && !name.startsWith(".");
    })
    .sort();
};

const walkFiles = (dir: string, base = dir): { path: string; absolute: string }[] => {
  const entries: { path: string; absolute: string }[] = [];
  for (const name of readdirSync(dir)) {
    if (name === ".DS_Store") {
      continue;
    }
    const absolute = join(dir, name);
    const stats = statSync(absolute);
    if (stats.isDirectory()) {
      entries.push(...walkFiles(absolute, base));
    } else if (stats.isFile()) {
      entries.push({
        absolute,
        path: relative(base, absolute).split("\\").join("/"),
      });
    }
  }
  return entries;
};

const apiFetch = async (
  path: string,
  init: RequestInit = {}
): Promise<Response> => {
  const url = `${apiUrl}${path}`;
  try {
    return await fetch(url, init);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Request to ${url} failed: ${detail}`);
  }
};

const readError = async (response: Response): Promise<string> => {
  const text = await response.text();
  try {
    const json = JSON.parse(text) as { message?: string };
    return json.message ?? text;
  } catch {
    return text || response.statusText;
  }
};

const listPublicAgents = async (): Promise<AgentSummary[]> => {
  const agents: AgentSummary[] = [];
  let page = 1;
  const pageSize = 100;

  for (;;) {
    const response = await apiFetch(
      `/public-catalog/agents?page=${page}&pageSize=${pageSize}`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to list public catalog (${response.status}): ${await readError(response)}`
      );
    }
    const body = (await response.json()) as AgentsPage;
    agents.push(...body.data);
    if (agents.length >= body.total || body.data.length === 0) {
      break;
    }
    page += 1;
  }

  return agents;
};

const listAllAgents = async (): Promise<AgentSummary[]> => {
  const agents: AgentSummary[] = [];
  let page = 1;
  const pageSize = 100;

  for (;;) {
    const response = await apiFetch(
      `/agents?page=${page}&pageSize=${pageSize}`,
      { headers: authHeaders() }
    );
    if (!response.ok) {
      throw new Error(
        `Failed to list agents (${response.status}): ${await readError(response)}`
      );
    }
    const body = (await response.json()) as AgentsPage;
    agents.push(...body.data);
    if (agents.length >= body.total || body.data.length === 0) {
      break;
    }
    page += 1;
  }

  return agents;
};

const findAgentByName = async (name: string): Promise<AgentSummary | null> => {
  // Public catalog needs no auth and is enough for featured-agent re-sync.
  const publicMatch = (await listPublicAgents()).find(
    (agent) => agent.name === name
  );
  if (publicMatch) {
    return publicMatch;
  }

  try {
    const agents = await listAllAgents();
    return agents.find((agent) => agent.name === name) ?? null;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.log(`  Authenticated agent list unavailable (${detail})`);
    return null;
  }
};

const createAgent = async (
  name: string,
  description: string
): Promise<AgentSummary> => {
  const response = await apiFetch("/agents", {
    body: JSON.stringify({
      description,
      name,
      visibility: "public",
    }),
    headers: jsonHeaders(),
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create agent "${name}" (${response.status}): ${await readError(response)}`
    );
  }

  return (await response.json()) as AgentSummary;
};

const uploadVersion = async (
  agentId: string,
  agentDir: string,
  message: string
): Promise<VersionRecord> => {
  const form = new FormData();
  form.append("message", message);

  for (const file of walkFiles(agentDir)) {
    const bytes = new Uint8Array(readFileSync(file.absolute));
    form.append("files", new Blob([bytes]), file.path);
  }

  const response = await apiFetch(`/agents/${agentId}/versions`, {
    body: form,
    headers: authHeaders(),
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to upload version for ${agentId} (${response.status}): ${await readError(response)}`
    );
  }

  return (await response.json()) as VersionRecord;
};

const enableAgent = async (agentId: string, versionId: string): Promise<void> => {
  const response = await apiFetch(`/agents/${agentId}/enable`, {
    body: JSON.stringify({ versionId }),
    headers: jsonHeaders(),
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to enable agent ${agentId} (${response.status}): ${await readError(response)}`
    );
  }
};

const maybeConnectDiscord = async (agentId: string): Promise<void> => {
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
  const publicKey = process.env.DISCORD_PUBLIC_KEY?.trim();
  const applicationId = process.env.DISCORD_APPLICATION_ID?.trim();

  if (!(botToken && publicKey && applicationId)) {
    return;
  }

  const listResponse = await apiFetch(`/agents/${agentId}/channels`, {
    headers: authHeaders(),
  });
  if (!listResponse.ok) {
    throw new Error(
      `Failed to list channels for ${agentId} (${listResponse.status}): ${await readError(listResponse)}`
    );
  }

  const channels = (await listResponse.json()) as Array<{ type?: string }>;
  const hasDiscord = channels.some((binding) => binding.type === "discord");

  if (hasDiscord) {
    console.log(`  Discord already connected for ${agentId}`);
    return;
  }

  const connectResponse = await apiFetch(`/agents/${agentId}/channels/discord`, {
    body: JSON.stringify({
      applicationId,
      botToken,
      publicKey,
    }),
    headers: jsonHeaders(),
    method: "POST",
  });

  if (!connectResponse.ok) {
    throw new Error(
      `Failed to connect Discord for ${agentId} (${connectResponse.status}): ${await readError(connectResponse)}`
    );
  }

  console.log(`  Connected Discord for ${agentId}`);
};

const readAgentDisplayName = (
  agentDir: string,
  folderName: string
): string => {
  const readmePath = join(agentDir, "README.md");
  if (!existsSync(readmePath)) {
    return folderName;
  }
  const heading = readFileSync(readmePath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("# "));
  if (!heading) {
    return folderName;
  }
  return heading.replace(/^#\s+/, "").trim() || folderName;
};

const readAgentDescription = (agentDir: string, folderName: string): string => {
  const readmePath = join(agentDir, "README.md");
  if (!existsSync(readmePath)) {
    return `Featured Aleph agent: ${folderName}`;
  }
  const lines = readFileSync(readmePath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const firstParagraph = lines.find((line) => !line.startsWith("#"));
  return firstParagraph ?? `Featured Aleph agent: ${folderName}`;
};

const updateAgentMetadata = async (
  agentId: string,
  name: string,
  description: string
): Promise<void> => {
  const response = await apiFetch(`/agents/${agentId}`, {
    body: JSON.stringify({ description, name }),
    headers: jsonHeaders(),
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to update agent ${agentId} (${response.status}): ${await readError(response)}`
    );
  }
};

const syncMessage = (): string => {
  const sha = process.env.GITHUB_SHA?.slice(0, 7);
  if (sha) {
    return `sync from git ${sha}`;
  }
  return `sync ${new Date().toISOString()}`;
};

const syncAgent = async (
  folderName: string,
  cache: AgentCache
): Promise<void> => {
  const agentDir = join(AGENTS_DIR, folderName);
  const displayName = readAgentDisplayName(agentDir, folderName);
  const description = readAgentDescription(agentDir, folderName);
  console.log(`\nSyncing agents/${folderName} → "${displayName}"`);

  let agentId: string | null = cache[folderName]?.agentId ?? null;
  let organizationId: string | null =
    cache[folderName]?.organizationId ?? null;

  if (agentId !== null) {
    const probe = await apiFetch(`/agents/${agentId}`, {
      headers: authHeaders(),
    });
    if (!probe.ok) {
      console.log(`  Cached id ${agentId} not found; resolving by name`);
      agentId = null;
    }
  }

  if (!agentId) {
    const existing =
      (await findAgentByName(displayName)) ??
      (await findAgentByName(folderName));
    if (existing) {
      agentId = existing.id;
      organizationId = existing.organizationId;
      console.log(`  Found existing agent ${agentId}`);
    } else {
      const created = await createAgent(displayName, description);
      agentId = created.id;
      organizationId = created.organizationId;
      console.log(`  Created agent ${agentId}`);
    }
  }

  await updateAgentMetadata(agentId, displayName, description);
  console.log(`  Metadata set to "${displayName}"`);

  const version = await uploadVersion(agentId, agentDir, syncMessage());
  console.log(`  Uploaded version ${version.id}`);

  await enableAgent(agentId, version.id);
  console.log(`  Enabled at version ${version.id}`);

  await maybeConnectDiscord(agentId);

  cache[folderName] = { agentId, organizationId };
};

const main = async (): Promise<void> => {
  const folders = listAgentFolders();
  if (folders.length === 0) {
    console.log("No agent folders found under agents/");
    return;
  }

  console.log(`Aleph API: ${apiUrl}`);
  console.log(`Agents to sync: ${folders.join(", ")}`);

  const cache = loadCache();
  for (const folder of folders) {
    await syncAgent(folder, cache);
    saveCache(cache);
  }

  const fingerprint = createHash("sha256")
    .update(folders.join("|"))
    .digest("hex")
    .slice(0, 8);
  console.log(`\nDone. Sync fingerprint ${fingerprint}`);
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
