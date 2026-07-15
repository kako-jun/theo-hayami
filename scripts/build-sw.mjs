import { createHash } from "node:crypto";
import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const outDir = resolve(root, "dist");
const tempSw = resolve(outDir, "sw-bundle.js");
const finalSw = resolve(outDir, "sw.js");
const precacheExtensions = new Set([".js", ".css", ".html", ".svg", ".woff2"]);

await build({
  configFile: false,
  root,
  logLevel: "warn",
  build: {
    emptyOutDir: false,
    outDir,
    minify: true,
    sourcemap: false,
    lib: {
      entry: resolve(root, "src/sw.ts"),
      formats: ["es"],
      fileName: () => "sw-bundle.js",
    },
    rollupOptions: {
      output: {
        entryFileNames: "sw-bundle.js",
      },
    },
  },
});

const precacheEntries = await collectPrecacheEntries(outDir);
const manifestEntries = precacheEntries.map(({ url, revision }) => ({ url, revision }));
const swSource = await readFile(tempSw, "utf-8");
const swWithManifest = swSource.replace("self.__WB_MANIFEST", JSON.stringify(manifestEntries));
if (swWithManifest === swSource) {
  throw new Error("self.__WB_MANIFEST injection point was not found in bundled service worker");
}

await writeFile(finalSw, swWithManifest);
await rm(tempSw, { force: true });

const totalSize = precacheEntries.reduce((sum, entry) => sum + entry.size, 0);
console.log(`[build-sw] ${manifestEntries.length} files (${totalSize} bytes) precached into dist/sw.js`);

async function collectPrecacheEntries(dir) {
  const entries = [];
  await walk(dir, entries);
  entries.sort((a, b) => a.url.localeCompare(b.url));
  return entries;
}

async function walk(dir, entries) {
  for (const dirent of await readdir(dir, { withFileTypes: true })) {
    const fullPath = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      await walk(fullPath, entries);
      continue;
    }
    if (!shouldPrecache(fullPath)) continue;
    const bytes = await readFile(fullPath);
    entries.push({
      url: toDistUrl(fullPath),
      revision: createHash("sha256").update(bytes).digest("hex").slice(0, 16),
      size: bytes.length,
    });
  }
}

function shouldPrecache(filePath) {
  if (filePath === tempSw || filePath === finalSw) return false;
  return precacheExtensions.has(filePath.slice(filePath.lastIndexOf(".")));
}

function toDistUrl(filePath) {
  return relative(outDir, filePath).split(sep).join("/");
}
