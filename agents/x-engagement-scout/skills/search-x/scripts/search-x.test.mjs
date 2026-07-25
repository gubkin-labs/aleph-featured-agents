import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeSearchResponse,
  searchRecentPosts,
} from "./search-x.mjs";

const fixture = {
  data: [
    {
      author_id: "user-1",
      created_at: "2026-07-25T08:00:00.000Z",
      id: "post-1",
      lang: "en",
      public_metrics: {
        impression_count: 1200,
        like_count: 14,
        quote_count: 2,
        reply_count: 5,
        retweet_count: 3,
      },
      text: "Customer-cloud deployments need a better operating model.",
    },
  ],
  includes: {
    users: [{ id: "user-1", name: "Dev Infra", username: "devinfra" }],
  },
};

test("normalizes a successful response and creates a canonical URL", () => {
  assert.deepEqual(normalizeSearchResponse(fixture), [
    {
      author: { id: "user-1", name: "Dev Infra", username: "devinfra" },
      createdAt: "2026-07-25T08:00:00.000Z",
      id: "post-1",
      language: "en",
      metrics: {
        impressions: 1200,
        likes: 14,
        quotes: 2,
        replies: 5,
        reposts: 3,
      },
      text: "Customer-cloud deployments need a better operating model.",
      url: "https://x.com/devinfra/status/post-1",
    },
  ]);
});

test("returns an empty array when the API has no data", () => {
  assert.deepEqual(normalizeSearchResponse({ meta: { result_count: 0 } }), []);
});

test("drops partial posts without an author or canonical identity", () => {
  assert.deepEqual(
    normalizeSearchResponse({
      data: [{ id: "post-1", text: "Missing author expansion" }],
    }),
    []
  );
});

test("uses the bearer token only in the authorization header", async () => {
  const calls = [];
  const candidates = await searchRecentPosts({
    bearerToken: "fixture-secret",
    fetchImplementation: async (url, init) => {
      calls.push({ init, url: String(url) });
      return new Response(JSON.stringify(fixture), {
        headers: { "content-type": "application/json" },
        status: 200,
      });
    },
    maxResults: 25,
    query: "BYOC lang:en -is:retweet",
  });

  assert.equal(candidates.length, 1);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.headers.authorization, "Bearer fixture-secret");
  assert.equal(calls[0].url.includes("fixture-secret"), false);
});

test("redacts remote error bodies and credentials from API failures", async () => {
  await assert.rejects(
    searchRecentPosts({
      bearerToken: "fixture-secret",
      fetchImplementation: async () =>
        new Response("fixture-secret private remote detail", { status: 429 }),
      maxResults: 25,
      query: "BYOC",
    }),
    {
      message: "X recent search failed with HTTP 429",
    }
  );
});

test("returns a generic error when the network request fails", async () => {
  await assert.rejects(
    searchRecentPosts({
      bearerToken: "fixture-secret",
      fetchImplementation: async () => {
        throw new Error("socket included fixture-secret");
      },
      maxResults: 25,
      query: "BYOC",
    }),
    {
      message: "X recent search request failed",
    }
  );
});
