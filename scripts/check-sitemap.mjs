import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const site = "https://theo-hayami.llll-ll.com";
const distDir = resolve(root, "dist");

await checkTeaTimePagesInSitemap();

async function checkTeaTimePagesInSitemap() {
  const teaTimeDir = resolve(distDir, "tea-time");
  if (!existsSync(teaTimeDir)) {
    throw new Error("dist/tea-time was not found. Run this after astro build.");
  }

  const teaTimeUrls = [];
  for (const dirent of await readdir(teaTimeDir, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue;
    const htmlPath = resolve(teaTimeDir, dirent.name, "index.html");
    if (!existsSync(htmlPath)) continue;
    teaTimeUrls.push(`${site}/tea-time/${dirent.name}/`);
  }
  teaTimeUrls.sort();

  const sitemapText = await readSitemaps();
  const missing = teaTimeUrls.filter((url) => !sitemapText.includes(`<loc>${url}</loc>`));
  if (missing.length > 0) {
    throw new Error(`Tea Time pages are missing from sitemap:\n${missing.join("\n")}`);
  }

  console.log(`[check-sitemap] ${teaTimeUrls.length} tea-time page(s) listed in sitemap`);
}

async function readSitemaps() {
  const files = await readdir(distDir);
  const sitemapFiles = files
    .filter((file) => /^sitemap-\d+\.xml$/.test(file))
    .sort();
  if (sitemapFiles.length === 0) {
    throw new Error("No dist/sitemap-*.xml files were found.");
  }

  const contents = await Promise.all(
    sitemapFiles.map((file) => readFile(resolve(distDir, file), "utf-8")),
  );
  return contents.join("\n");
}
