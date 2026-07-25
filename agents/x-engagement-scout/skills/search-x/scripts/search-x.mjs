#!/usr/bin/env node

const API_URL = "https://api.x.com/2/tweets/search/recent";
const MIN_RESULTS = 10;
const MAX_RESULTS = 100;

const isRecord = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const optionalString = (value) =>
  typeof value === "string" && value.length > 0 ? value : null;

const optionalNumber = (value) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const normalizeMetrics = (value) => {
  const metrics = isRecord(value) ? value : {};
  return {
    impressions: optionalNumber(metrics.impression_count),
    likes: optionalNumber(metrics.like_count),
    quotes: optionalNumber(metrics.quote_count),
    replies: optionalNumber(metrics.reply_count),
    reposts: optionalNumber(metrics.retweet_count),
  };
};

export const normalizeSearchResponse = (payload) => {
  if (!isRecord(payload)) {
    throw new Error("X returned an invalid response");
  }

  const posts = Array.isArray(payload.data) ? payload.data : [];
  const includes = isRecord(payload.includes) ? payload.includes : {};
  const users = Array.isArray(includes.users) ? includes.users : [];
  const usersById = new Map(
    users
      .filter((user) => isRecord(user) && optionalString(user.id))
      .map((user) => [user.id, user])
  );

  return posts.flatMap((post) => {
    if (!isRecord(post)) {
      return [];
    }

    const id = optionalString(post.id);
    const text = optionalString(post.text);
    const authorId = optionalString(post.author_id);
    const user = authorId ? usersById.get(authorId) : undefined;
    const username =
      isRecord(user) && optionalString(user.username)
        ? optionalString(user.username)
        : null;

    if (!(id && text && username)) {
      return [];
    }

    return [
      {
        author: {
          id: authorId,
          name: isRecord(user) ? optionalString(user.name) : null,
          username,
        },
        createdAt: optionalString(post.created_at),
        id,
        language: optionalString(post.lang),
        metrics: normalizeMetrics(post.public_metrics),
        text,
        url: `https://x.com/${username}/status/${id}`,
      },
    ];
  });
};

const parseArguments = (argv) => {
  let query = null;
  let maxResults = 25;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];

    if (argument === "--query" && value) {
      query = value.trim();
      index += 1;
      continue;
    }

    if (argument === "--max-results" && value) {
      maxResults = Number(value);
      index += 1;
      continue;
    }

    throw new Error(`Unsupported or incomplete argument: ${argument ?? ""}`);
  }

  if (!query) {
    throw new Error("--query is required");
  }
  if (
    !Number.isInteger(maxResults) ||
    maxResults < MIN_RESULTS ||
    maxResults > MAX_RESULTS
  ) {
    throw new Error(
      `--max-results must be an integer from ${MIN_RESULTS} to ${MAX_RESULTS}`
    );
  }

  return { maxResults, query };
};

export const searchRecentPosts = async ({
  bearerToken,
  fetchImplementation = fetch,
  maxResults,
  query,
}) => {
  if (typeof bearerToken !== "string" || bearerToken.length === 0) {
    throw new Error("X_BEARER_TOKEN is required");
  }

  const url = new URL(API_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("max_results", String(maxResults));
  url.searchParams.set(
    "tweet.fields",
    "author_id,created_at,lang,public_metrics"
  );
  url.searchParams.set("expansions", "author_id");
  url.searchParams.set("user.fields", "name,username");

  let response;
  try {
    response = await fetchImplementation(url, {
      headers: { authorization: `Bearer ${bearerToken}` },
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new Error("X recent search request failed");
  }

  if (!response.ok) {
    throw new Error(`X recent search failed with HTTP ${response.status}`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("X returned invalid JSON");
  }

  return normalizeSearchResponse(payload);
};

const writeJson = (value, stream = process.stdout) => {
  stream.write(`${JSON.stringify(value, null, 2)}\n`);
};

const main = async () => {
  try {
    const options = parseArguments(process.argv.slice(2));
    const candidates = await searchRecentPosts({
      bearerToken: process.env.X_BEARER_TOKEN,
      ...options,
    });
    writeJson({ candidates, count: candidates.length, ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "X recent search failed";
    writeJson(
      {
        error: message,
        fallback: "Use web_search with an equivalent focused query",
        ok: false,
      },
      process.stderr
    );
    process.exitCode = 1;
  }
};

const isDirectExecution =
  process.argv[1] && import.meta.url === new URL(process.argv[1], "file:").href;

if (isDirectExecution) {
  await main();
}
