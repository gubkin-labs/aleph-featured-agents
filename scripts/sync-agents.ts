#!/usr/bin/env node
/**
 * Sync agent folders under agents/ to Aleph (create → metadata → version → disable).
 *
 * Catalog metadata lives in agents/<folder>/aleph.json (not uploaded as a bundle file).
 * Platform root manifest.json remains reserved — do not add it to agent folders.
 */

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const AGENTS_DIR = join(ROOT, "agents");
const CACHE_DIR = join(ROOT, ".aleph");
const CACHE_FILE = join(CACHE_DIR, "agents.json");
const CATALOG_MANIFEST = "aleph.json";
const GITHUB_REPO = "gubkin-labs/aleph-featured-agents";

const DEFAULT_API_URL = "https://api.aleph-agent.com";

/** Sync-only paths — never uploaded as bundle version files. */
const SYNC_ONLY_BASENAMES = new Set([CATALOG_MANIFEST]);

type AgentCache = Record<
  string,
  { agentId: string; organizationId: string | null }
>;

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

type AgentCatalogManifest = {
  name: string;
  description: string;
  /** Defaults to public; private agents remain repository-visible only. */
  visibility?: "private" | "public";
  /** Relative path under the agent folder, e.g. "cover.jpg". */
  icon?: string;
  /** Absolute URL override (skips GitHub/jsDelivr resolution). */
  iconUrl?: string;
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

const isSyncOnlyPath = (relativePath: string, iconRelative?: string): boolean => {
  const normalized = relativePath.split("\\").join("/");
  if (SYNC_ONLY_BASENAMES.has(basename(normalized))) {
    return true;
  }
  if (iconRelative && normalized === iconRelative.split("\\").join("/")) {
    return true;
  }
  return false;
};

const walkFiles = (
  dir: string,
  base = dir,
  iconRelative?: string
): { path: string; absolute: string }[] => {
  const entries: { path: string; absolute: string }[] = [];
  for (const name of readdirSync(dir)) {
    if (name === ".DS_Store") {
      continue;
    }
    const absolute = join(dir, name);
    const stats = statSync(absolute);
    if (stats.isDirectory()) {
      entries.push(...walkFiles(absolute, base, iconRelative));
    } else if (stats.isFile()) {
      const path = relative(base, absolute).split("\\").join("/");
      if (isSyncOnlyPath(path, iconRelative)) {
        continue;
      }
      entries.push({ absolute, path });
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
    const json = JSON.parse(text) as { message?: string; code?: string };
    if (json.code === "RATE_LIMITED" || response.status === 429) {
      return `${json.message ?? text} (HTTP ${response.status}; recreate or wait — API key rate limited)`;
    }
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
  description: string,
  iconUrl: string | null,
  visibility: "private" | "public"
): Promise<AgentSummary> => {
  const response = await apiFetch("/agents", {
    body: JSON.stringify({
      description,
      ...(iconUrl ? { iconUrl } : {}),
      name,
      visibility,
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
  message: string,
  iconRelative?: string
): Promise<VersionRecord> => {
  const form = new FormData();
  form.append("message", message);

  for (const file of walkFiles(agentDir, agentDir, iconRelative)) {
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

const disableAgent = async (agentId: string): Promise<void> => {
  const response = await apiFetch(`/agents/${agentId}/disable`, {
    headers: authHeaders(),
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to disable agent ${agentId} (${response.status}): ${await readError(response)}`
    );
  }
};

const readFallbackDisplayName = (
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

const readFallbackDescription = (
  agentDir: string,
  folderName: string
): string => {
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

const readCatalogManifest = (
  agentDir: string,
  folderName: string
): AgentCatalogManifest => {
  const manifestPath = join(agentDir, CATALOG_MANIFEST);
  if (!existsSync(manifestPath)) {
    throw new Error(
      `Missing ${CATALOG_MANIFEST} in agents/${folderName} (required for sync metadata)`
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON in agents/${folderName}/${CATALOG_MANIFEST}: ${detail}`);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error(`agents/${folderName}/${CATALOG_MANIFEST} must be a JSON object`);
  }

  const record = parsed as Record<string, unknown>;
  const name =
    typeof record.name === "string" && record.name.trim()
      ? record.name.trim()
      : readFallbackDisplayName(agentDir, folderName);
  const description =
    typeof record.description === "string" && record.description.trim()
      ? record.description.trim()
      : readFallbackDescription(agentDir, folderName);
  const icon =
    typeof record.icon === "string" && record.icon.trim()
      ? record.icon.trim().replace(/^\.\//, "")
      : undefined;
  const iconUrl =
    typeof record.iconUrl === "string" && record.iconUrl.trim()
      ? record.iconUrl.trim()
      : undefined;
  const visibility =
    record.visibility === "private" || record.visibility === "public"
      ? record.visibility
      : "public";

  if (
    record.visibility !== undefined &&
    record.visibility !== "private" &&
    record.visibility !== "public"
  ) {
    throw new Error(
      `agents/${folderName}/${CATALOG_MANIFEST}: visibility must be \"private\" or \"public\"`
    );
  }

  if (icon?.includes("..") || icon?.startsWith("/")) {
    throw new Error(
      `agents/${folderName}/${CATALOG_MANIFEST}: icon must be a relative path inside the agent folder`
    );
  }

  if (icon) {
    const iconPath = join(agentDir, icon);
    if (!existsSync(iconPath) || !statSync(iconPath).isFile()) {
      throw new Error(
        `agents/${folderName}/${CATALOG_MANIFEST}: icon file not found: ${icon}`
      );
    }
  }

  if (iconUrl) {
    try {
      new URL(iconUrl);
    } catch {
      throw new Error(
        `agents/${folderName}/${CATALOG_MANIFEST}: iconUrl must be an absolute URL`
      );
    }
  }

  return { description, icon, iconUrl, name, visibility };
};

const resolveIconUrl = (
  folderName: string,
  manifest: AgentCatalogManifest
): string | null => {
  if (manifest.iconUrl) {
    return manifest.iconUrl;
  }
  if (!manifest.icon) {
    return null;
  }

  const ref =
    process.env.GITHUB_SHA?.trim() ||
    process.env.ALEPH_ICON_REF?.trim() ||
    "main";
  const encodedPath = `agents/${folderName}/${manifest.icon}`
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  // jsDelivr serves public GitHub files; pin to the sync commit when available.
  return `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@${ref}/${encodedPath}`;
};

const updateAgentMetadata = async (
  agentId: string,
  name: string,
  description: string,
  iconUrl: string | null,
  visibility: "private" | "public"
): Promise<void> => {
  const response = await apiFetch(`/agents/${agentId}`, {
    body: JSON.stringify({
      description,
      iconUrl,
      name,
      visibility,
    }),
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
  const manifest = readCatalogManifest(agentDir, folderName);
  const iconUrl = resolveIconUrl(folderName, manifest);
  console.log(`\nSyncing agents/${folderName} → "${manifest.name}"`);

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
      (await findAgentByName(manifest.name)) ??
      (await findAgentByName(folderName));
    if (existing) {
      agentId = existing.id;
      organizationId = existing.organizationId;
      console.log(`  Found existing agent ${agentId}`);
    } else {
      const created = await createAgent(
        manifest.name,
        manifest.description,
        iconUrl,
        manifest.visibility ?? "public"
      );
      agentId = created.id;
      organizationId = created.organizationId;
      console.log(`  Created agent ${agentId}`);
    }
  }

  await updateAgentMetadata(
    agentId,
    manifest.name,
    manifest.description,
    iconUrl,
    manifest.visibility ?? "public"
  );
  console.log(
    iconUrl
      ? `  Metadata set (name, description, icon)`
      : `  Metadata set (name, description; no icon)`
  );
  if (iconUrl) {
    console.log(`  iconUrl: ${iconUrl}`);
  }

  const version = await uploadVersion(
    agentId,
    agentDir,
    syncMessage(),
    manifest.icon
  );
  console.log(`  Uploaded version ${version.id}`);

  // Featured catalog templates stay disabled — users clone then enable.
  await disableAgent(agentId);
  console.log(`  Disabled (catalog template; latest version ${version.id})`);

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
