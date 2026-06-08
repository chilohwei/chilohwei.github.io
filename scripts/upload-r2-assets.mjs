#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_BUCKET = "files";
const DEFAULT_PREFIX = "blog";
const DEFAULT_PUBLIC_BASE = "https://files.chiloh.net";
const DEFAULT_CACHE_CONTROL = "public, max-age=31536000, immutable";

const CONTENT_TYPES = new Map([
  [".avif", "image/avif"],
  [".gif", "image/gif"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".mp4", "video/mp4"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".webp", "image/webp"],
]);

function usage() {
  const script = path.relative(process.cwd(), fileURLToPath(import.meta.url));
  return `Usage:
  node ${script} [options] <file...>

Options:
  --bucket <name>          R2 bucket. Default: R2_BUCKET or ${DEFAULT_BUCKET}
  --prefix <path>          Object key prefix. Default: R2_PREFIX or ${DEFAULT_PREFIX}
  --key <path>             Exact object key. Only valid for one file.
  --public-base <url>      Public asset base URL. Default: ${DEFAULT_PUBLIC_BASE}
  --cache-control <value>  Cache-Control metadata. Default: ${DEFAULT_CACHE_CONTROL}
  --json                   Print machine-readable JSON.
  --dry-run                Show what would be uploaded without sending requests.
  -h, --help               Show this help.

Examples:
  npm run upload:r2 -- images/blog/agent-organization-map.svg
  npm run upload:r2 -- --prefix blog _posts-assets/cover.png
  npm run upload:r2 -- --key blog/custom-name.png ./cover.png
`;
}

function parseArgs(argv) {
  const options = {
    bucket: process.env.R2_BUCKET || DEFAULT_BUCKET,
    cacheControl: process.env.R2_CACHE_CONTROL || DEFAULT_CACHE_CONTROL,
    dryRun: false,
    files: [],
    json: false,
    key: undefined,
    prefix: process.env.R2_PREFIX || DEFAULT_PREFIX,
    publicBase: process.env.R2_PUBLIC_BASE || process.env.PUBLIC_ASSET_BASE || DEFAULT_PUBLIC_BASE,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const readValue = () => {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${arg} requires a value`);
      }
      index += 1;
      return value;
    };

    if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "--bucket") {
      options.bucket = readValue();
    } else if (arg === "--cache-control") {
      options.cacheControl = readValue();
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--key") {
      options.key = readValue();
    } else if (arg === "--prefix") {
      options.prefix = readValue();
    } else if (arg === "--public-base") {
      options.publicBase = readValue();
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      options.files.push(arg);
    }
  }

  return options;
}

function encodePathPart(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function normalizePrefix(prefix) {
  return prefix.replace(/^\/+|\/+$/g, "");
}

function objectKeyFor(filePath, options) {
  if (options.key) {
    return options.key.replace(/^\/+/, "");
  }

  const prefix = normalizePrefix(options.prefix);
  const filename = path.basename(filePath);
  return prefix ? `${prefix}/${filename}` : filename;
}

function contentTypeFor(filePath) {
  return CONTENT_TYPES.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
}

function publicUrlFor(key, options) {
  const base = options.publicBase.replace(/\/+$/g, "");
  const encodedKey = key.split("/").map(encodePathPart).join("/");
  return `${base}/${encodedKey}`;
}

function markdownFor(filePath, publicUrl) {
  const alt = path.basename(filePath, path.extname(filePath)).replace(/[-_]+/g, " ");
  return `![${alt}](${publicUrl})`;
}

function runWrangler(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["--yes", "wrangler@latest", ...args], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(new Error(stderr || stdout || `wrangler exited with code ${code}`));
    });
  });
}

async function uploadFile(filePath, key, contentType, options) {
  if (options.dryRun) {
    return { status: "dry-run" };
  }

  await runWrangler([
    "r2",
    "object",
    "put",
    `${options.bucket}/${key}`,
    "--file",
    filePath,
    "--content-type",
    contentType,
    "--cache-control",
    options.cacheControl,
    "--remote",
    "-y",
  ]);

  return { status: "uploaded" };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  if (options.files.length === 0) {
    throw new Error("No files provided.\n\n" + usage());
  }

  if (options.key && options.files.length !== 1) {
    throw new Error("--key can only be used with one file.");
  }

  const results = [];
  for (const file of options.files) {
    const absolutePath = path.resolve(file);
    const stat = fs.statSync(absolutePath);
    if (!stat.isFile()) {
      throw new Error(`Not a file: ${file}`);
    }

    const key = objectKeyFor(absolutePath, options);
    const contentType = contentTypeFor(absolutePath);
    const publicUrl = publicUrlFor(key, options);
    const upload = await uploadFile(absolutePath, key, contentType, options);

    results.push({
      cacheControl: options.cacheControl,
      contentType,
      key,
      localPath: absolutePath,
      markdown: markdownFor(absolutePath, publicUrl),
      publicUrl,
      size: stat.size,
      ...upload,
    });
  }

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  for (const result of results) {
    console.log(`Uploaded: ${result.localPath}`);
    console.log(`  key: ${result.key}`);
    console.log(`  type: ${result.contentType}`);
    console.log(`  url: ${result.publicUrl}`);
    console.log(`  markdown: ${result.markdown}`);
    console.log("");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
