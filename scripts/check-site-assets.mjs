#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const DEFAULT_ROOTS = [
  "_posts",
  "_posts_en",
  "_includes",
  "_layouts",
  "_plugins",
  "_config.yml",
  "about.md",
  "en",
  "feed.xml",
  "package.json",
  "scripts",
  "_site",
];

const BANNED_PATTERNS = [
  /chiloh_wei/i,
  /weibo\.com/i,
  />Weibo</i,
  new RegExp("bit" + "ful", "i"),
  new RegExp("bit" + "iful", "i"),
  new RegExp("bit" + "cdn\\.chiloh\\.cn", "i"),
  new RegExp("chiloh" + "data\\.s3", "i"),
  new RegExp("chiloh" + "data\\.oss", "i"),
  new RegExp("upload-" + "bit" + "iful", "i"),
  new RegExp("upload:" + "bit" + "iful", "i"),
];

function walk(target, output = []) {
  if (!fs.existsSync(target)) {
    return output;
  }

  const stat = fs.statSync(target);
  if (stat.isFile()) {
    output.push(target);
    return output;
  }

  if (!stat.isDirectory()) {
    return output;
  }

  for (const name of fs.readdirSync(target)) {
    if ([".git", "node_modules", "vendor"].includes(name)) {
      continue;
    }
    walk(path.join(target, name), output);
  }
  return output;
}

function textFiles(roots) {
  return roots.flatMap((root) => walk(root)).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return [
      ".css",
      ".html",
      ".js",
      ".json",
      ".md",
      ".rb",
      ".scss",
      ".xml",
      ".yml",
      ".yaml",
      "",
    ].includes(ext);
  });
}

function findBannedReferences(files) {
  const hits = [];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    text.split(/\n/).forEach((line, index) => {
      const pattern = BANNED_PATTERNS.find((candidate) => candidate.test(line));
      if (pattern) {
        hits.push({
          file,
          line: index + 1,
          pattern: String(pattern),
          text: line.trim(),
        });
      }
    });
  }
  return hits;
}

function findR2Urls(files) {
  const urls = new Set();
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(/https:\/\/files\.chiloh\.net\/[^\s\)"'<>{]+/g)) {
      const url = match[0].replace(/[.,;]+$/g, "");
      if (url.includes("#{") || url.includes("{%") || url.includes("#")) {
        continue;
      }
      urls.add(url);
    }
  }
  return [...urls].sort();
}

function findMissingR2ReferrerPolicy(files) {
  const hits = [];
  const htmlFiles = files.filter((file) => path.extname(file).toLowerCase() === ".html");

  for (const file of htmlFiles) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(/<img\b[^>]*\bsrc=["']https:\/\/files\.chiloh\.net\/[^"']+["'][^>]*>/gi)) {
      const tag = match[0];
      if (!/\breferrerpolicy=["']no-referrer["']/i.test(tag)) {
        hits.push({
          file,
          tag: tag.slice(0, 240),
        });
      }
    }
  }

  return hits;
}

function findMalformedCloudflareImageUrls(files) {
  const hits = [];

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(/https:\/\/files\.chiloh\.net\/cdn-cgi\/image\/[^"' <>\n]+/g)) {
      const url = match[0].replace(/[.,;]+$/g, "");
      const options = url.match(/\/cdn-cgi\/image\/([^/]+)\//)?.[1] ?? "";
      if (options.includes(",")) {
        hits.push({
          file,
          url,
        });
      }
    }
  }

  return hits;
}

function isRasterImageUrl(url) {
  const cleanUrl = url.split(/[?#]/)[0].toLowerCase();
  return /\.(avif|jpe?g|png|webp)$/.test(cleanUrl);
}

function contentTypeForMagic(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  if (
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    return "image/avif";
  }
  return null;
}

async function probe(url) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    return {
      ok: response.ok,
      status: response.status,
      url,
    };
  } catch (error) {
    return {
      error: error.message,
      ok: false,
      url,
    };
  }
}

async function probeImageMime(url) {
  try {
    const response = await fetch(url, {
      headers: {
        range: "bytes=0-15",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    const declaredType = response.headers.get("content-type")?.split(";")[0].toLowerCase() ?? "";
    const bytes = new Uint8Array(await response.arrayBuffer());
    const actualType = contentTypeForMagic(bytes);

    return {
      actualType,
      declaredType,
      ok: response.ok && (!actualType || declaredType === actualType),
      status: response.status,
      url,
    };
  } catch (error) {
    return {
      error: error.message,
      ok: false,
      url,
    };
  }
}

async function probeAll(urls) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < urls.length) {
      const url = urls[index];
      index += 1;
      results.push(await probe(url));
    }
  }

  await Promise.all(Array.from({ length: 8 }, worker));
  return results.sort((a, b) => a.url.localeCompare(b.url));
}

async function probeImageMimes(urls) {
  const imageUrls = urls.filter(isRasterImageUrl);
  const results = [];
  let index = 0;

  async function worker() {
    while (index < imageUrls.length) {
      const url = imageUrls[index];
      index += 1;
      results.push(await probeImageMime(url));
    }
  }

  await Promise.all(Array.from({ length: 8 }, worker));
  return results.sort((a, b) => a.url.localeCompare(b.url));
}

async function main() {
  const roots = process.argv.slice(2);
  const files = textFiles(roots.length ? roots : DEFAULT_ROOTS);
  const bannedHits = findBannedReferences(files);
  const malformedCloudflareImageUrls = findMalformedCloudflareImageUrls(files);
  const missingR2ReferrerPolicy = findMissingR2ReferrerPolicy(files);
  const urls = findR2Urls(files);
  const probeResults = await probeAll(urls);
  const mimeResults = await probeImageMimes(urls);
  const failedUrls = probeResults.filter((result) => !result.ok);
  const mimeMismatches = mimeResults.filter((result) => !result.ok);

  const summary = {
    bannedHits,
    checkedFiles: files.length,
    failedUrls,
    malformedCloudflareImageUrls,
    mimeMismatches,
    missingR2ReferrerPolicy,
    r2Urls: urls.length,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (
    bannedHits.length > 0 ||
    failedUrls.length > 0 ||
    malformedCloudflareImageUrls.length > 0 ||
    mimeMismatches.length > 0 ||
    missingR2ReferrerPolicy.length > 0
  ) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
