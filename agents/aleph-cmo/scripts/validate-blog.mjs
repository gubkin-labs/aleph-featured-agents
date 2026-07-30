import { readFile, readdir, realpath } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";

const fail = (message) => {
  process.stderr.write(`Blog validation failed: ${message}\n`);
  process.exit(1);
};

const requestedPath = process.argv[2];
if (!requestedPath) {
  fail("usage: node scripts/validate-blog.mjs PATH_TO_BLOG_POST");
}

const workspace =
  process.env.ALEPH_CMO_WORKSPACE ??
  join(process.env.HOME, "aleph-cmo-workspace");
const blogDirectory = await realpath(
  join(workspace, "project10-frontend", "content", "blog")
);
const articlePath = await realpath(resolve(requestedPath)).catch(() =>
  fail(`file does not exist: ${requestedPath}`)
);
const pathWithinBlog = relative(blogDirectory, articlePath);

if (
  pathWithinBlog.startsWith("..") ||
  pathWithinBlog === "" ||
  dirname(articlePath) !== blogDirectory ||
  !articlePath.endsWith(".md")
) {
  fail("article must be one Markdown file directly inside content/blog");
}

const source = (await readFile(articlePath, "utf8")).replaceAll("\r\n", "\n");
if (!source.startsWith("---\n")) {
  fail("frontmatter must begin with ---");
}

const closingIndex = source.indexOf("\n---\n", 4);
if (closingIndex === -1) {
  fail("frontmatter is not closed");
}

const metadata = {};
for (const line of source.slice(4, closingIndex).split("\n")) {
  const separator = line.indexOf(":");
  if (separator < 1) {
    fail(`invalid frontmatter line: ${line}`);
  }
  const key = line.slice(0, separator).trim();
  const rawValue = line.slice(separator + 1).trim();
  metadata[key] = rawValue.replace(/^(['"])(.*)\1$/, "$2");
}

for (const key of [
  "title",
  "description",
  "slug",
  "order",
  "status",
  "author",
  "date",
]) {
  if (!metadata[key]) {
    fail(`missing required frontmatter field: ${key}`);
  }
}

if (!/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/.test(metadata.slug)) {
  fail("slug must contain lowercase letters, numbers, hyphens, or slashes");
}
if (`${metadata.slug}.md` !== basename(articlePath)) {
  fail("frontmatter slug must match the Markdown filename");
}
if (!/^\d+$/.test(metadata.order)) {
  fail("order must be a non-negative integer");
}
if (!["published", "planned", "draft"].includes(metadata.status)) {
  fail("status must be published, planned, or draft");
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.date)) {
  fail("date must use YYYY-MM-DD");
}
if (!source.slice(closingIndex + 5).trim()) {
  fail("article body is empty");
}

for (const filename of await readdir(blogDirectory)) {
  if (!filename.endsWith(".md") || filename === basename(articlePath)) {
    continue;
  }
  const existing = await readFile(join(blogDirectory, filename), "utf8");
  if (existing.includes(`\nslug: ${metadata.slug}\n`)) {
    fail(`slug duplicates ${filename}`);
  }
}

process.stdout.write(`Blog validation passed: ${articlePath}\n`);
