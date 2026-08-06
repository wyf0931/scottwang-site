#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const contentRoot = path.join(root, "content");
const publicAssetRoot = path.join(root, "public", "obsidian-assets");
const supportedTypes = new Set(["writing", "notes", "thoughts"]);
const supportedKinds = new Set(["essay", "note", "thought", "resource"]);
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"]);
const ignoredDirectories = new Set([".obsidian", ".trash", ".git", "node_modules"]);

function usage() {
  console.log(`Usage:
  node scripts/import-obsidian.mjs <vault-or-folder> [options]

Options:
  --type notes|writing|thoughts   Target content type. Default: notes
  --kind note|essay|thought|resource
                                 Target content kind. Default follows type
  --tag <tag>                    Add a tag to every imported note. Can repeat
  --draft                        Import as draft. Default
  --publish                      Import as public content
  --overwrite                    Replace existing imported files
  --dry-run                      Print planned writes without changing files
  --help                         Show this help

Examples:
  node scripts/import-obsidian.mjs ~/Documents/ObsidianVault --dry-run
  node scripts/import-obsidian.mjs ~/Documents/ObsidianVault --tag Obsidian --tag Inbox
  node scripts/import-obsidian.mjs ~/Documents/ObsidianVault/AI --publish --overwrite
`);
}

function parseArgs(argv) {
  const args = { source: "", type: "notes", kind: "", tags: [], draft: true, overwrite: false, dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (item === "--help" || item === "-h") {
      args.help = true;
    } else if (item === "--type") {
      args.type = argv[++index] ?? "";
    } else if (item === "--kind") {
      args.kind = argv[++index] ?? "";
    } else if (item === "--tag") {
      args.tags.push(argv[++index] ?? "");
    } else if (item === "--draft") {
      args.draft = true;
    } else if (item === "--publish") {
      args.draft = false;
    } else if (item === "--overwrite") {
      args.overwrite = true;
    } else if (item === "--dry-run") {
      args.dryRun = true;
    } else if (!args.source) {
      args.source = item;
    } else {
      throw new Error(`Unknown argument: ${item}`);
    }
  }
  args.tags = args.tags.map(cleanTag).filter(Boolean);
  if (!args.kind) args.kind = args.type === "writing" ? "essay" : args.type === "thoughts" ? "thought" : "note";
  if (!supportedTypes.has(args.type)) throw new Error(`Unsupported type: ${args.type}`);
  if (!supportedKinds.has(args.kind)) throw new Error(`Unsupported kind: ${args.kind}`);
  return args;
}

function walkMarkdownFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) files.push(...walkMarkdownFiles(path.join(directory, entry.name)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(path.join(directory, entry.name));
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
}

function walkAllFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) files.push(...walkAllFiles(path.join(directory, entry.name)));
    } else if (entry.isFile()) {
      files.push(path.join(directory, entry.name));
    }
  }
  return files;
}

function slugify(input) {
  return input
    .normalize("NFKC")
    .trim()
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    || "untitled";
}

function cleanTag(input) {
  return String(input ?? "").trim().replace(/^#/, "").replaceAll(" ", "-");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

function dateOnly(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function descriptionFrom(markdown, fallback) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[\[.*?\]\]/g, " ")
    .replace(/\[\[([^\]|#]+).*?\]\]/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/^>\s*\[![^\]]+\].*$/gm, "")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.slice(0, 120) : fallback;
}

function frontmatterText(data) {
  const lines = [
    "---",
    `title: ${yamlString(data.title)}`,
    `description: ${yamlString(data.description)}`,
    `date: ${yamlString(data.date)}`,
  ];
  if (data.updated) lines.push(`updated: ${yamlString(data.updated)}`);
  lines.push(`type: ${yamlString(data.type)}`);
  lines.push(`kind: ${yamlString(data.kind)}`);
  lines.push("tags:");
  if (data.tags.length) {
    for (const tag of data.tags) lines.push(`  - ${yamlString(tag)}`);
  } else {
    lines.push("  - Obsidian");
  }
  lines.push(`draft: ${data.draft ? "true" : "false"}`);
  lines.push("---");
  return `${lines.join("\n")}\n\n`;
}

function buildAssetIndex(files) {
  const byName = new Map();
  for (const file of files) {
    const key = path.basename(file).toLowerCase();
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(file);
  }
  return byName;
}

function safeAssetName(input) {
  const ext = path.extname(input);
  const base = path.basename(input, ext);
  return `${slugify(base)}${ext.toLowerCase()}`;
}

function findAsset(target, noteFile, vaultRoot, assetIndex) {
  const decoded = decodeURIComponent(String(target).trim());
  const candidates = [];
  if (decoded) {
    candidates.push(path.resolve(path.dirname(noteFile), decoded));
    candidates.push(path.resolve(vaultRoot, decoded));
  }
  for (const candidate of candidates) {
    if (candidate.startsWith(vaultRoot) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  const matches = assetIndex.get(path.basename(decoded).toLowerCase()) ?? [];
  return matches[0] ?? "";
}

function copyAsset(asset, slug, dryRun) {
  const filename = safeAssetName(asset);
  const outputDirectory = path.join(publicAssetRoot, slug);
  const outputFile = path.join(outputDirectory, filename);
  if (!dryRun) {
    fs.mkdirSync(outputDirectory, { recursive: true });
    fs.copyFileSync(asset, outputFile);
  }
  return `/obsidian-assets/${slug}/${filename}`;
}

function anchorFrom(input) {
  return slugify(input).replace(/^-+|-+$/g, "");
}

function convertWikiTarget(raw, type) {
  const [targetPart, aliasPart] = raw.split("|");
  const [notePart, headingPart] = targetPart.split("#");
  const label = aliasPart || headingPart || notePart || targetPart;
  const slug = slugify(notePart || targetPart);
  const hash = headingPart ? `#${anchorFrom(headingPart)}` : "";
  return { label: label.trim(), href: `/${type}/${slug}${hash}` };
}

function convertBody(markdown, context) {
  let body = markdown.replace(/^%%[\s\S]*?%%\s*/gm, "");

  body = body.replace(/!\[\[([^\]]+)\]\]/g, (_, rawTarget) => {
    const target = rawTarget.split("|")[0].split("#")[0].trim();
    const asset = findAsset(target, context.noteFile, context.vaultRoot, context.assetIndex);
    if (!asset || !imageExtensions.has(path.extname(asset).toLowerCase())) return `![${target}](${target})`;
    const publicPath = copyAsset(asset, context.slug, context.dryRun);
    return `![${path.basename(target, path.extname(target))}](${publicPath})`;
  });

  body = body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, rawTarget) => {
    if (/^(https?:)?\/\//.test(rawTarget) || rawTarget.startsWith("/")) return match;
    const asset = findAsset(rawTarget, context.noteFile, context.vaultRoot, context.assetIndex);
    if (!asset || !imageExtensions.has(path.extname(asset).toLowerCase())) return match;
    const publicPath = copyAsset(asset, context.slug, context.dryRun);
    return `![${alt || path.basename(rawTarget, path.extname(rawTarget))}](${publicPath})`;
  });

  body = body.replace(/\[\[([^\]]+)\]\]/g, (_, rawTarget) => {
    const { label, href } = convertWikiTarget(rawTarget, context.type);
    return `[${label}](${href})`;
  });

  body = body.replace(/^>\s*\[!([A-Z]+)\]\s*(.*)$/gm, (_, kind, title) => {
    const label = title ? `${kind} ${title}` : kind;
    return `> **${label}**`;
  });

  return body.trim();
}

function noteTags(frontmatter, cliTags) {
  const original = Array.isArray(frontmatter.tags)
    ? frontmatter.tags
    : typeof frontmatter.tags === "string"
      ? frontmatter.tags.split(/[,\s]+/)
      : [];
  return unique([...original.map(cleanTag), ...cliTags, "Obsidian"]);
}

function importFile(file, args, vaultRoot, assetIndex) {
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(raw);
  const baseTitle = path.basename(file, ".md");
  const title = String(parsed.data.title || parsed.data.name || baseTitle).trim();
  const slug = slugify(parsed.data.slug || title);
  const body = convertBody(parsed.content, { noteFile: file, vaultRoot, assetIndex, slug, type: args.type, dryRun: args.dryRun });
  const stat = fs.statSync(file);
  const date = dateOnly(parsed.data.date || parsed.data.created || stat.birthtime) || dateOnly(new Date());
  const updated = dateOnly(parsed.data.updated || parsed.data.modified || stat.mtime);
  const description = String(parsed.data.description || parsed.data.summary || descriptionFrom(body, title)).trim();
  const frontmatter = frontmatterText({
    title,
    description,
    date,
    updated: updated && updated !== date ? updated : "",
    type: args.type,
    kind: parsed.data.kind && supportedKinds.has(parsed.data.kind) ? parsed.data.kind : args.kind,
    tags: noteTags(parsed.data, args.tags),
    draft: args.draft,
  });
  const outputDirectory = path.join(contentRoot, args.type, slug);
  const outputFile = path.join(outputDirectory, "index.md");
  if (fs.existsSync(outputFile) && !args.overwrite) {
    return { status: "skipped", file, outputFile, reason: "exists" };
  }
  if (!args.dryRun) {
    fs.mkdirSync(outputDirectory, { recursive: true });
    fs.writeFileSync(outputFile, `${frontmatter}${body}\n`);
  }
  return { status: args.dryRun ? "planned" : "imported", file, outputFile };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }
  if (!args.source) throw new Error("Missing Obsidian vault or folder path.");
  const source = path.resolve(args.source);
  if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) throw new Error(`Source is not a directory: ${source}`);
  const markdownFiles = walkMarkdownFiles(source);
  const assetIndex = buildAssetIndex(walkAllFiles(source).filter((file) => imageExtensions.has(path.extname(file).toLowerCase())));
  const results = markdownFiles.map((file) => importFile(file, args, source, assetIndex));
  const imported = results.filter((item) => item.status === "imported" || item.status === "planned");
  const skipped = results.filter((item) => item.status === "skipped");
  for (const item of imported) {
    console.log(`${item.status}: ${path.relative(root, item.outputFile)}`);
  }
  for (const item of skipped) {
    console.log(`skipped: ${path.relative(root, item.outputFile)} (${item.reason})`);
  }
  console.log(`Done. ${imported.length} ${args.dryRun ? "planned" : "imported"}, ${skipped.length} skipped.`);
  if (args.draft) console.log("Imported notes are drafts. Review them, then set draft: false or rerun with --publish --overwrite.");
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  usage();
  process.exit(1);
}
