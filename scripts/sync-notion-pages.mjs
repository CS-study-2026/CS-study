#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const NOTION_VERSION = process.env.NOTION_VERSION || "2026-03-11";
const DEFAULT_DATABASE_ID = "2db4f7753cf280618152dc418edd9dcc";
const DEFAULT_DATA_SOURCE_ID = "2db4f775-3cf2-80a4-89dd-000bca3a3f83";
const EXCLUDED_WEEKS = new Set(["1월 2주차", "1월 3주차"]);

const args = parseArgs(process.argv.slice(2));
const notionToken = process.env.NOTION_TOKEN;
const databaseId = args["database-id"] || process.env.NOTION_DATABASE_ID || DEFAULT_DATABASE_ID;
const dataSourceId =
  args["data-source-id"] || process.env.NOTION_DATA_SOURCE_ID || DEFAULT_DATA_SOURCE_ID;
const userId = args["user-id"] || process.env.NOTION_USER_ID;
const outputDir = args["output-dir"] || process.env.OUTPUT_DIR || ".";
const dryRun = Boolean(args["dry-run"]);
const includeUploaded = Boolean(args["include-uploaded"]);
const markUploaded = Boolean(args["mark-uploaded"]);
const interactive = Boolean(args.interactive);
const selectedOnly = Boolean(args["selected-only"]);
const writePageIdsPath = args["write-page-ids"];
const markPageIdsPath = args["mark-page-ids"];
const writeAuthorsPath = args["write-authors"];

if (!notionToken) {
  fail("NOTION_TOKEN is required. Create a Notion integration token and share the database with it.");
}

if (markPageIdsPath) {
  await markPagesUploaded(markPageIdsPath);
  process.exit(0);
}

if (args["list-users"]) {
  const users = await listUsers();
  for (const user of users) {
    const email = user.person?.email ? ` <${user.person.email}>` : "";
    console.log(`${user.name || "(no name)"}${email}: ${user.id}`);
  }
  process.exit(0);
}

if (!userId && !args.all) {
  fail("NOTION_USER_ID is required unless --all is passed. Use --list-users to find it.");
}

let pages = await queryPages();
pages = pages.filter((page) => !EXCLUDED_WEEKS.has(getPageInfo(page).week));

if (writeAuthorsPath) {
  await writeAuthors(pages, writeAuthorsPath);
  process.exit(0);
}

if (pages.length === 0) {
  console.log("No matching Notion pages found.");
  process.exit(0);
}

if (interactive) {
  pages = await selectPages(pages);
  if (pages.length === 0) {
    console.log("No pages selected.");
    process.exit(0);
  }
}

const writtenPageIds = [];

for (const page of pages) {
  const info = getPageInfo(page);
  const targetDir = resolveTargetDir(info);
  const fileName = `${sanitizeFileName(info.title)}.md`;
  const relativePath = path.join(targetDir, fileName);
  const fullPath = path.join(outputDir, relativePath);

  if (dryRun) {
    console.log(`[dry-run] ${info.title} -> ${relativePath}`);
    continue;
  }

  const markdown = await pageToMarkdown(page.id, info);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, markdown, "utf8");
  console.log(`wrote ${relativePath}`);
  writtenPageIds.push(page.id);

  if (markUploaded) {
    await markPageUploaded(page.id);
  }
}

if (writePageIdsPath && !dryRun) {
  await fs.writeFile(writePageIdsPath, `${JSON.stringify(writtenPageIds, null, 2)}\n`, "utf8");
}

async function queryPages() {
  const filter = buildFilter();
  const results = [];
  let startCursor;

  do {
    const body = {
      page_size: 100,
      ...(filter ? { filter } : {}),
      ...(startCursor ? { start_cursor: startCursor } : {}),
      sorts: [{ property: "작성일", direction: "ascending" }],
    };

    const response = await queryDataSource(body);
    results.push(...response.results);
    startCursor = response.has_more ? response.next_cursor : undefined;
  } while (startCursor);

  return results;
}

async function queryDataSource(body) {
  try {
    return await notion(`/v1/databases/${databaseId}/query`, {
      method: "POST",
      body,
    });
  } catch (error) {
    const message = String(error.message);
    if (!message.includes("404") && !message.includes("invalid_request_url")) {
      throw error;
    }

    return notion(`/v1/data_sources/${dataSourceId}/query`, {
      method: "POST",
      body,
    });
  }
}

function buildFilter() {
  const filters = [];

  if (userId) {
    filters.push({
      property: "발표자",
      created_by: {
        contains: userId,
      },
    });
  }

  if (selectedOnly || !includeUploaded) {
    filters.push({
      property: "깃헙",
      checkbox: {
        equals: selectedOnly,
      },
    });
  }

  for (const week of EXCLUDED_WEEKS) {
    filters.push({
      property: "주차",
      select: {
        does_not_equal: week,
      },
    });
  }

  if (filters.length === 0) {
    return undefined;
  }

  return filters.length === 1 ? filters[0] : { and: filters };
}

async function pageToMarkdown(pageId, info) {
  const blocks = await listBlockChildren(pageId);
  const body = renderBlocks(blocks).trim();
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(info.title)}`,
    `notion: ${info.url}`,
    info.week ? `week: ${JSON.stringify(info.week)}` : undefined,
    info.category ? `category: ${JSON.stringify(info.category)}` : undefined,
    info.topics.length ? `topics: ${JSON.stringify(info.topics)}` : undefined,
    "---",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  return `${frontmatter}# ${info.title}\n\n${body}\n`;
}

async function selectPages(pages) {
  console.log("Select pages to write as Markdown.");
  console.log("Use numbers separated by commas, ranges such as 2-5, or 'all'.");
  console.log("");

  pages.forEach((page, index) => {
    const info = getPageInfo(page);
    const targetPath = path.join(resolveTargetDir(info), `${sanitizeFileName(info.title)}.md`);
    console.log(`${index + 1}. [${info.week || "no week"}] ${info.title}`);
    console.log(`   -> ${targetPath}`);
  });

  const rl = readline.createInterface({ input, output });
  const answer = await rl.question("\nUpload which pages? ");
  rl.close();

  const selectedIndexes = parseSelection(answer, pages.length);
  return pages.filter((_, index) => selectedIndexes.has(index));
}

function parseSelection(answer, max) {
  const normalized = answer.trim().toLowerCase();

  if (normalized === "all") {
    return new Set(Array.from({ length: max }, (_, index) => index));
  }

  const selected = new Set();

  for (const part of normalized.split(",")) {
    const value = part.trim();
    if (!value) continue;

    if (value.includes("-")) {
      const [start, end] = value.split("-").map((item) => Number(item.trim()));
      if (!Number.isInteger(start) || !Number.isInteger(end)) continue;
      for (let number = Math.min(start, end); number <= Math.max(start, end); number += 1) {
        if (number >= 1 && number <= max) selected.add(number - 1);
      }
      continue;
    }

    const number = Number(value);
    if (Number.isInteger(number) && number >= 1 && number <= max) {
      selected.add(number - 1);
    }
  }

  return selected;
}

async function listBlockChildren(blockId) {
  const blocks = [];
  let startCursor;

  do {
    const query = new URLSearchParams({ page_size: "100" });
    if (startCursor) query.set("start_cursor", startCursor);
    const response = await notion(`/v1/blocks/${blockId}/children?${query}`);

    for (const block of response.results) {
      if (block.has_children) {
        block.children = await listBlockChildren(block.id);
      }
      blocks.push(block);
    }

    startCursor = response.has_more ? response.next_cursor : undefined;
  } while (startCursor);

  return blocks;
}

async function listUsers() {
  const users = [];
  let startCursor;

  do {
    const query = new URLSearchParams({ page_size: "100" });
    if (startCursor) query.set("start_cursor", startCursor);
    const response = await notion(`/v1/users?${query}`);
    users.push(...response.results.filter((user) => user.type === "person"));
    startCursor = response.has_more ? response.next_cursor : undefined;
  } while (startCursor);

  return users;
}

async function writeAuthors(pages, authorsPath) {
  const authors = new Map();

  for (const page of pages) {
    const info = getPageInfo(page);
    const authorId = info.author.id || "unknown";
    const existing = authors.get(authorId);

    if (existing) {
      existing.count += 1;
      continue;
    }

    const name = info.author.name || authorId;
    authors.set(authorId, {
      id: authorId,
      name,
      branch: `notion-sync/${sanitizeBranchName(name || authorId)}`,
      count: 1,
    });
  }

  const data = Array.from(authors.values()).sort((a, b) => a.name.localeCompare(b.name));
  await fs.writeFile(authorsPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`wrote ${authorsPath} with ${data.length} author(s)`);
}

async function markPagesUploaded(pageIdsPath) {
  const content = await fs.readFile(pageIdsPath, "utf8");
  const pageIds = JSON.parse(content);

  if (!Array.isArray(pageIds)) {
    fail(`${pageIdsPath} must contain a JSON array of Notion page IDs.`);
  }

  for (const pageId of pageIds) {
    await markPageUploaded(pageId);
    console.log(`marked uploaded ${pageId}`);
  }
}

async function markPageUploaded(pageId) {
  await notion(`/v1/pages/${pageId}`, {
    method: "PATCH",
    body: {
      properties: {
        "깃헙": { checkbox: true },
      },
    },
  });
}

function renderBlocks(blocks, depth = 0) {
  return blocks
    .map((block) => renderBlock(block, depth))
    .filter(Boolean)
    .join("\n");
}

function renderBlock(block, depth) {
  const type = block.type;
  const data = block[type];
  const children = block.children?.length ? `\n${renderBlocks(block.children, depth + 1)}` : "";

  switch (type) {
    case "paragraph":
      return `${richText(data.rich_text)}${children}`.trim();
    case "heading_1":
      return `# ${richText(data.rich_text)}${children}`;
    case "heading_2":
      return `## ${richText(data.rich_text)}${children}`;
    case "heading_3":
      return `### ${richText(data.rich_text)}${children}`;
    case "bulleted_list_item":
      return `${indent(depth)}- ${richText(data.rich_text)}${children}`;
    case "numbered_list_item":
      return `${indent(depth)}1. ${richText(data.rich_text)}${children}`;
    case "to_do":
      return `${indent(depth)}- [${data.checked ? "x" : " "}] ${richText(data.rich_text)}${children}`;
    case "toggle":
      return `${indent(depth)}<details>\n${indent(depth)}<summary>${richText(data.rich_text)}</summary>\n\n${children.trim()}\n${indent(depth)}</details>`;
    case "quote":
      return `> ${richText(data.rich_text)}${children}`;
    case "callout":
      return `> ${data.icon?.emoji || "Note"} ${richText(data.rich_text)}${children}`;
    case "code":
      return `\`\`\`${data.language || ""}\n${plainText(data.rich_text)}\n\`\`\``;
    case "divider":
      return "---";
    case "image": {
      const url = data.type === "external" ? data.external.url : data.file?.url;
      const caption = richText(data.caption) || "image";
      return url ? `![${caption}](${url})` : "";
    }
    case "bookmark":
    case "link_preview":
      return data.url ? `[${data.url}](${data.url})` : "";
    case "table":
      return renderTable(block.children || []);
    case "table_row":
      return "";
    case "unsupported":
      return "";
    default:
      return richText(data?.rich_text || []) || children.trim();
  }
}

function renderTable(rows) {
  const cells = rows.map((row) => row.table_row.cells.map((cell) => richText(cell)));
  if (cells.length === 0) return "";

  const header = cells[0];
  const separator = header.map(() => "---");
  const rest = cells.slice(1);

  return [header, separator, ...rest]
    .map((row) => `| ${row.map((cell) => cell || " ").join(" | ")} |`)
    .join("\n");
}

function richText(items = []) {
  return items.map(renderRichText).join("");
}

function plainText(items = []) {
  return items.map((item) => item.plain_text || "").join("");
}

function renderRichText(item) {
  let text = item.plain_text || "";
  if (!text) return "";

  if (item.href) {
    text = `[${text}](${item.href})`;
  }
  if (item.annotations?.code) {
    text = `\`${text}\``;
  }
  if (item.annotations?.bold) {
    text = `**${text}**`;
  }
  if (item.annotations?.italic) {
    text = `_${text}_`;
  }
  if (item.annotations?.strikethrough) {
    text = `~~${text}~~`;
  }

  return text;
}

function getPageInfo(page) {
  const properties = page.properties;
  const title = richText(properties["제목"]?.title || []).trim() || "Untitled";
  const category = properties["분류"]?.select?.name || "";
  const week = properties["주차"]?.select?.name || "";
  const topics = properties["주제"]?.multi_select?.map((topic) => topic.name) || [];
  const author = properties["발표자"]?.created_by || page.created_by || {};

  return {
    title,
    category,
    week,
    topics,
    author: {
      id: author.id || "",
      name: author.name || "",
    },
    url: page.url,
  };
}

function resolveTargetDir(info) {
  if (info.topics.length === 0) {
    return "00. 자율 주제";
  }

  const topicFolders = new Map([
    ["컴퓨터 구조", "01. 컴퓨터 구조"],
    ["CPU", "01. 컴퓨터 구조"],
    ["문자 인식", "01. 컴퓨터 구조"],
    ["운영체제", "02. 운영체제"],
    ["자료 구조", "03. 자료구조 및 알고리즘"],
    ["자료구조", "03. 자료구조 및 알고리즘"],
    ["이진탐색트리", "03. 자료구조 및 알고리즘"],
    ["알고리즘", "03. 자료구조 및 알고리즘"],
    ["네트워크", "04. 네트워크"],
    ["웹/앱", "04. 네트워크"],
    ["데이터베이스", "05. 데이터베이스"],
  ]);

  for (const topic of info.topics) {
    if (topicFolders.has(topic)) {
      return topicFolders.get(topic);
    }
  }

  return "00. 자율 주제";
}

function sanitizeFileName(name) {
  const cleaned = name
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const hash = crypto.createHash("sha1").update(cleaned).digest("hex").slice(0, 8);
  const suffix = `-${hash}`;
  const maxBaseBytes = 120 - Buffer.byteLength(suffix);
  const base = truncateUtf8(cleaned, maxBaseBytes).replace(/[ .]+$/g, "");

  return `${base || "Untitled"}${suffix}`;
}

function truncateUtf8(value, maxBytes) {
  let output = "";
  let bytes = 0;

  for (const char of value) {
    const charBytes = Buffer.byteLength(char);
    if (bytes + charBytes > maxBytes) break;
    output += char;
    bytes += charBytes;
  }

  return output;
}

function sanitizeBranchName(name) {
  const sanitized = name
    .replace(/[~^:?*[\]\\]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/\/+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return sanitized || "unknown";
}

function indent(depth) {
  return "  ".repeat(depth);
}

async function notion(endpoint, options = {}) {
  const response = await fetch(`https://api.notion.com${endpoint}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${notionToken}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }

  return response.json();
}

function parseArgs(argv) {
  const parsed = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;

    const key = arg.slice(2);
    const next = argv[i + 1];

    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      i += 1;
    }
  }

  return parsed;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
