#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_ENDPOINT = "https://s3.bitiful.net";
const DEFAULT_REGION = "cn-east-1";
const DEFAULT_BUCKET = "chilohdata";
const DEFAULT_PREFIX = "blog";
const DEFAULT_PUBLIC_BASE = "https://bitcdn.chiloh.cn";

const IMAGE_STYLE_EXTENSIONS = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
]);

const CONTENT_TYPES = new Map([
  [".avif", "image/avif"],
  [".gif", "image/gif"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".webp", "image/webp"],
]);

function usage() {
  const script = path.relative(process.cwd(), fileURLToPath(import.meta.url));
  return `Usage:
  node ${script} [options] <file...>

Options:
  --bucket <name>       S3 bucket. Default: BITIFUL_BUCKET or ${DEFAULT_BUCKET}
  --prefix <path>       Object key prefix. Default: BITIFUL_PREFIX or ${DEFAULT_PREFIX}
  --key <path>          Exact object key. Only valid for one file.
  --endpoint <url>      S3 endpoint. Default: ${DEFAULT_ENDPOINT}
  --addressing <style>  S3 addressing style: virtual or path. Default: virtual
  --region <name>       S3 signing region. Default: ${DEFAULT_REGION}
  --public-base <url>   Public CDN/base URL. Default: ${DEFAULT_PUBLIC_BASE}
  --style <name|none>   Append !style=<name> to raster image URLs. Default: article
  --json                Print machine-readable JSON.
  --dry-run             Show what would be uploaded without sending requests.
  -h, --help            Show this help.

Environment:
  BITIFUL_ACCESS_KEY_ID / BITIFUL_SECRET_ACCESS_KEY
  or AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY

Examples:
  npm run upload:bitiful -- images/blog/agent-organization-map.svg
  npm run upload:bitiful -- --prefix blog _posts-assets/cover.png
  npm run upload:bitiful -- --key blog/custom-name.png ./cover.png
`;
}

function parseArgs(argv) {
  const options = {
    bucket: process.env.BITIFUL_BUCKET || process.env.S3_BUCKET || DEFAULT_BUCKET,
    endpoint: process.env.BITIFUL_ENDPOINT || process.env.S3_ENDPOINT || DEFAULT_ENDPOINT,
    addressing: process.env.BITIFUL_ADDRESSING_STYLE || "virtual",
    files: [],
    json: false,
    key: undefined,
    prefix: process.env.BITIFUL_PREFIX || DEFAULT_PREFIX,
    publicBase: process.env.BITIFUL_PUBLIC_BASE || process.env.PUBLIC_ASSET_BASE || DEFAULT_PUBLIC_BASE,
    region: process.env.BITIFUL_REGION || process.env.AWS_REGION || DEFAULT_REGION,
    style: process.env.BITIFUL_IMAGE_STYLE || "article",
    dryRun: false,
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
    } else if (arg === "--endpoint") {
      options.endpoint = readValue();
    } else if (arg === "--addressing") {
      options.addressing = readValue();
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--key") {
      options.key = readValue();
    } else if (arg === "--prefix") {
      options.prefix = readValue();
    } else if (arg === "--public-base") {
      options.publicBase = readValue();
    } else if (arg === "--region") {
      options.region = readValue();
    } else if (arg === "--style") {
      options.style = readValue();
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

function getCredentials() {
  const accessKeyId =
    process.env.BITIFUL_ACCESS_KEY_ID ||
    process.env.BITFUL_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY_ID;

  const secretAccessKey =
    process.env.BITIFUL_SECRET_ACCESS_KEY ||
    process.env.BITFUL_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing credentials. Set BITIFUL_ACCESS_KEY_ID and BITIFUL_SECRET_ACCESS_KEY.",
    );
  }

  return { accessKeyId, secretAccessKey };
}

function hash(value, encoding = "hex") {
  return crypto.createHash("sha256").update(value).digest(encoding);
}

function hmac(key, value, encoding) {
  return crypto.createHmac("sha256", key).update(value).digest(encoding);
}

function getSigningKey(secretAccessKey, dateStamp, region, service) {
  const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

function amzDates(now = new Date()) {
  const iso = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return {
    amzDate: iso,
    dateStamp: iso.slice(0, 8),
  };
}

function encodePathPart(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function encodeKeyPath(key) {
  return key.split("/").map(encodePathPart).join("/");
}

function normalizePrefix(prefix) {
  return prefix.replace(/^\/+|\/+$/g, "");
}

function objectKeyFor(filePath, options) {
  if (options.key) {
    return options.key.replace(/^\/+/, "");
  }

  const filename = path.basename(filePath);
  const prefix = normalizePrefix(options.prefix);
  return prefix ? `${prefix}/${filename}` : filename;
}

function contentTypeFor(filePath) {
  return CONTENT_TYPES.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
}

function publicUrlFor(key, filePath, options) {
  const base = options.publicBase.replace(/\/+$/g, "");
  const encodedKey = key.split("/").map(encodePathPart).join("/");
  const rawUrl = `${base}/${encodedKey}`;
  const extension = path.extname(filePath).toLowerCase();

  if (options.style && options.style !== "none" && IMAGE_STYLE_EXTENSIONS.has(extension)) {
    return `${rawUrl}!style=${encodeURIComponent(options.style)}`;
  }

  return rawUrl;
}

function markdownFor(filePath, publicUrl) {
  const alt = path.basename(filePath, path.extname(filePath)).replace(/[-_]+/g, " ");
  return `![${alt}](${publicUrl})`;
}

function putObject({ addressing, body, bucket, contentType, credentials, endpoint, key, region }) {
  const endpointUrl = new URL(endpoint);
  const encodedKey = encodeKeyPath(key);
  const canonicalUri =
    addressing === "path" ? `/${encodePathPart(bucket)}/${encodedKey}` : `/${encodedKey}`;
  const hostname =
    addressing === "path" ? endpointUrl.hostname : `${bucket}.${endpointUrl.hostname}`;
  const host = endpointUrl.port ? `${hostname}:${endpointUrl.port}` : hostname;
  const { amzDate, dateStamp } = amzDates();
  const payloadHash = hash(body);
  const service = "s3";

  const headers = {
    "content-length": String(body.length),
    "content-type": contentType,
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  const signedHeaders = Object.keys(headers)
    .sort()
    .join(";");

  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((header) => `${header}:${headers[header]}`)
    .join("\n");

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    "",
    `${canonicalHeaders}\n`,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hash(canonicalRequest),
  ].join("\n");

  const signingKey = getSigningKey(credentials.secretAccessKey, dateStamp, region, service);
  const signature = hmac(signingKey, stringToSign, "hex");

  const authorization = [
    `AWS4-HMAC-SHA256 Credential=${credentials.accessKeyId}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`,
  ].join(", ");

  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname,
        method: "PUT",
        path: canonicalUri,
        port: endpointUrl.port || 443,
        protocol: endpointUrl.protocol,
        headers: {
          Authorization: authorization,
          "Content-Length": headers["content-length"],
          "Content-Type": headers["content-type"],
          Host: headers.host,
          "x-amz-content-sha256": headers["x-amz-content-sha256"],
          "x-amz-date": headers["x-amz-date"],
        },
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const responseBody = Buffer.concat(chunks).toString("utf8");
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve({
              etag: response.headers.etag,
              requestId: response.headers["x-amz-request-id"],
              statusCode: response.statusCode,
            });
          } else {
            reject(
              new Error(
                `Upload failed for ${key}: HTTP ${response.statusCode}\n${responseBody}`,
              ),
            );
          }
        });
      },
    );

    request.on("error", reject);
    request.end(body);
  });
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

  if (!["path", "virtual"].includes(options.addressing)) {
    throw new Error("--addressing must be either virtual or path.");
  }

  const credentials = options.dryRun ? null : getCredentials();
  const results = [];

  for (const file of options.files) {
    const absolutePath = path.resolve(file);
    const stat = fs.statSync(absolutePath);
    if (!stat.isFile()) {
      throw new Error(`Not a file: ${file}`);
    }

    const body = fs.readFileSync(absolutePath);
    const key = objectKeyFor(absolutePath, options);
    const contentType = contentTypeFor(absolutePath);
    const publicUrl = publicUrlFor(key, absolutePath, options);

    const upload = options.dryRun
      ? { statusCode: "dry-run" }
      : await putObject({
          body,
          bucket: options.bucket,
          contentType,
          credentials,
          endpoint: options.endpoint,
          addressing: options.addressing,
          key,
          region: options.region,
        });

    results.push({
      contentType,
      key,
      localPath: absolutePath,
      markdown: markdownFor(absolutePath, publicUrl),
      publicUrl,
      size: body.length,
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
    if (result.etag) {
      console.log(`  etag: ${result.etag}`);
    }
    console.log("");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
