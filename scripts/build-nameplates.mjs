import { mkdirSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));
const sourceRoot = join(root, "assets/masters/nameplates");
const outputRoot = join(root, "assets/images/nameplates");

const slugs = [
  "theo",
  "vincia",
  "aristo",
  "kantia",
  "hegru",
  "dekaris",
  "spino",
  "hue",
  "makiya",
  "ou",
];

const langs = ["ja", "en"];
const targetContentHeight = 420;
const paddingX = 56;
const paddingY = 40;
const alphaLow = 18;
const alphaHigh = 55;
const bboxAlphaThreshold = 10;

function smoothstep(t) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

function detectBackground(data, width, height, channels) {
  const sample = Math.min(48, Math.floor(Math.min(width, height) / 8));
  const points = [
    [0, 0],
    [width - sample, 0],
    [0, height - sample],
    [width - sample, height - sample],
  ];
  const sum = [0, 0, 0];
  let count = 0;

  for (const [startX, startY] of points) {
    for (let y = startY; y < startY + sample; y += 1) {
      for (let x = startX; x < startX + sample; x += 1) {
        const i = (y * width + x) * channels;
        sum[0] += data[i];
        sum[1] += data[i + 1];
        sum[2] += data[i + 2];
        count += 1;
      }
    }
  }

  return sum.map((value) => value / count);
}

function keyedRgba(input, width, height, channels, key) {
  const out = Buffer.alloc(width * height * 4);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const src = (y * width + x) * channels;
      const dst = (y * width + x) * 4;
      const r = input[src];
      const g = input[src + 1];
      const b = input[src + 2];
      const distance = Math.hypot(r - key[0], g - key[1], b - key[2]);
      const alphaRatio = smoothstep((distance - alphaLow) / (alphaHigh - alphaLow));
      const alpha = Math.round(alphaRatio * 255);

      if (alpha > 0 && alpha < 255) {
        const a = alphaRatio;
        out[dst] = Math.max(0, Math.min(255, Math.round((r - key[0] * (1 - a)) / a)));
        out[dst + 1] = Math.max(0, Math.min(255, Math.round((g - key[1] * (1 - a)) / a)));
        out[dst + 2] = Math.max(0, Math.min(255, Math.round((b - key[2] * (1 - a)) / a)));
      } else {
        out[dst] = r;
        out[dst + 1] = g;
        out[dst + 2] = b;
      }
      out[dst + 3] = alpha;

      if (alpha > bboxAlphaThreshold) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    throw new Error("content bbox was empty");
  }

  return {
    rgba: out,
    bbox: {
      left: minX,
      top: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    },
  };
}

async function buildOne(lang, slug) {
  const sourcePath = join(sourceRoot, lang, `${slug}.png`);
  const outputPath = join(outputRoot, lang, `${slug}.webp`);
  const { data, info } = await sharp(sourcePath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const key = detectBackground(data, info.width, info.height, info.channels);
  const { rgba, bbox } = keyedRgba(data, info.width, info.height, info.channels, key);
  const scale = targetContentHeight / bbox.height;
  const resizedWidth = Math.round(bbox.width * scale);
  const outputWidth = resizedWidth + paddingX * 2;
  const outputHeight = targetContentHeight + paddingY * 2;

  mkdirSync(join(outputRoot, lang), { recursive: true });

  await sharp(rgba, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .extract(bbox)
    .resize({
      width: resizedWidth,
      height: targetContentHeight,
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .extend({
      top: paddingY,
      bottom: paddingY,
      left: paddingX,
      right: paddingX,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 85, alphaQuality: 100, effort: 6 })
    .toFile(outputPath);

  return {
    lang,
    slug,
    source: `${info.width}x${info.height}`,
    key: key.map((value) => Math.round(value)).join(","),
    bbox: `${bbox.width}x${bbox.height}+${bbox.left}+${bbox.top}`,
    output: `${outputWidth}x${outputHeight}`,
  };
}

for (const lang of langs) {
  const dir = join(sourceRoot, lang);
  const files = new Set(readdirSync(dir).map((file) => basename(file, ".png")));
  for (const slug of slugs) {
    if (!files.has(slug)) {
      throw new Error(`missing source: ${join(dir, `${slug}.png`)}`);
    }
  }
}

const results = [];
for (const lang of langs) {
  for (const slug of slugs) {
    results.push(await buildOne(lang, slug));
  }
}

console.table(results);
