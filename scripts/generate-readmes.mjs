#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const BASE_TOPIC_DIRS = [
  "00. 자율 주제",
  "01. 컴퓨터 구조",
  "02. 운영체제",
  "03. 자료구조 및 알고리즘",
  "04. 네트워크",
  "05. 데이터베이스",
];
const NON_TOPIC_DIRS = new Set(["assets", "node_modules", "scripts"]);
const GENERATED_MARKER =
  "<!-- 이 파일은 scripts/generate-readmes.mjs로 자동 생성됩니다. 직접 수정하지 마세요. -->";

const collator = new Intl.Collator("ko-KR", {
  numeric: true,
  sensitivity: "base",
});

const topicDirs = await listTopicDirs();

for (const dir of topicDirs) {
  await fs.mkdir(dir, { recursive: true });
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md") || entry.name === "README.md") {
      continue;
    }

    const filePath = path.join(dir, entry.name);
    const content = await fs.readFile(filePath, "utf8");
    const frontmatter = parseFrontmatter(content);

    pages.push({
      fileName: entry.name,
      title: frontmatter.title || entry.name.replace(/\.md$/i, ""),
      author: frontmatter.author || "",
      week: frontmatter.week || "",
    });
  }

  pages.sort((a, b) => {
    const byWeek = collator.compare(a.week, b.week);
    if (byWeek !== 0) return byWeek;
    return collator.compare(a.fileName, b.fileName);
  });

  const readme = renderReadme(dir, pages);
  const readmePath = path.join(dir, "README.md");
  await fs.writeFile(readmePath, readme, "utf8");
  console.log(`wrote ${readmePath}`);
}

function parseFrontmatter(content) {
  if (!content.startsWith("---\n")) {
    return {};
  }

  const end = content.indexOf("\n---", 4);
  if (end === -1) {
    return {};
  }

  const frontmatter = {};
  const lines = content.slice(4, end).split("\n");

  for (const line of lines) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    frontmatter[key] = parseValue(rawValue);
  }

  return frontmatter;
}

function parseValue(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed.replace(/^["']|["']$/g, "");
  }
}

function renderReadme(dir, pages) {
  const lines = [
    `# ${dir}`,
    "",
    GENERATED_MARKER,
    "",
  ];

  if (pages.length === 0) {
    lines.push("아직 등록된 페이지가 없습니다.", "");
    return lines.join("\n");
  }

  lines.push(`총 ${pages.length}개의 페이지가 있습니다.`, "");
  lines.push("| 주차 | 제목 | 작성자 |");
  lines.push("| --- | --- | --- |");

  for (const page of pages) {
    const link = encodeMarkdownLink(page.fileName);
    lines.push(
      `| ${escapeTableCell(page.week || "-")} | [${escapeTableCell(page.title)}](./${link}) | ${escapeTableCell(page.author || "-")} |`,
    );
  }

  lines.push("");
  return lines.join("\n");
}

async function listTopicDirs() {
  const entries = await fs.readdir(".", { withFileTypes: true });
  const dirs = new Set(BASE_TOPIC_DIRS);

  for (const entry of entries) {
    if (
      !entry.isDirectory() ||
      entry.name.startsWith(".") ||
      NON_TOPIC_DIRS.has(entry.name) ||
      dirs.has(entry.name)
    ) {
      continue;
    }

    const childEntries = await fs.readdir(entry.name, { withFileTypes: true });
    const hasMarkdownPage = childEntries.some(
      (child) => child.isFile() && child.name.endsWith(".md") && child.name !== "README.md",
    );
    const readmePath = path.join(entry.name, "README.md");
    let hasGeneratedReadme = false;

    try {
      hasGeneratedReadme = (await fs.readFile(readmePath, "utf8")).includes(GENERATED_MARKER);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }

    if (hasMarkdownPage || hasGeneratedReadme) {
      dirs.add(entry.name);
    }
  }

  return [...dirs].sort(collator.compare);
}

function encodeMarkdownLink(fileName) {
  return encodeURIComponent(fileName).replace(/%2F/g, "/");
}

function escapeTableCell(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
}
