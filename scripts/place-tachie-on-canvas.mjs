#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { dirname, extname } from "node:path";
import { tmpdir } from "node:os";
import sharp from "sharp";

function usage() {
  console.error(`Usage:
  node scripts/place-tachie-on-canvas.mjs \\
    --input <finalized.png> \\
    --output <asset.png|asset.webp> \\
    [--canvas <width>x<height>] \\
    (--offset <x>,<y> | --reference <existing.webp|png> [--align bbox-left-bottom|bbox-center-bottom] [--threshold 50])

This reproduces the existing standing-image head-align paste semantics:
PIL Image.paste(img, (x, y), img). Do not replace it with alpha_composite.`);
}

function readArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith("--") || value == null || value.startsWith("--")) {
      usage();
      process.exit(2);
    }
    args[key.slice(2)] = value;
    i += 1;
  }
  for (const key of ["input", "output"]) {
    if (!args[key]) {
      usage();
      process.exit(2);
    }
  }
  if (!args.offset && !args.reference) {
    usage();
    process.exit(2);
  }
  if (args.offset && args.reference) {
    usage();
    process.exit(2);
  }
  return {
    input: args.input,
    output: args.output,
    canvas: args.canvas,
    offset: args.offset,
    reference: args.reference,
    align: args.align ?? "bbox-left-bottom",
    threshold: Number(args.threshold ?? "50"),
  };
}

function parseCanvas(value) {
  const canvas = value?.match(/^(\d+)x(\d+)$/);
  if (!canvas) {
    usage();
    process.exit(2);
  }
  return { canvasW: Number(canvas[1]), canvasH: Number(canvas[2]) };
}

function parseOffset(value) {
  const offset = value?.match(/^(-?\d+),(-?\d+)$/);
  if (!offset) {
    usage();
    process.exit(2);
  }
  return { offsetX: Number(offset[1]), offsetY: Number(offset[2]) };
}

function alphaBbox(rgba, width, height, threshold) {
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;
  const cutoff = Math.floor((threshold / 100) * 255);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (rgba[(y * width + x) * 4 + 3] > cutoff) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }

  if (right < 0) {
    throw new Error(`No alpha pixels above ${threshold}%`);
  }

  return {
    left,
    right,
    top,
    bottom,
    width: right - left + 1,
    height: bottom - top + 1,
    centerX: (left + right) / 2,
  };
}

async function readRgba(path) {
  const image = sharp(path).ensureAlpha();
  const meta = await image.metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`Cannot read image dimensions: ${path}`);
  }
  return {
    data: await image.raw().toBuffer(),
    width: meta.width,
    height: meta.height,
  };
}

function deriveOffset(inputBbox, referenceBbox, align) {
  if (align === "bbox-left-bottom") {
    return {
      offsetX: Math.round(referenceBbox.left - inputBbox.left),
      offsetY: Math.round(referenceBbox.bottom - inputBbox.bottom),
    };
  }
  if (align === "bbox-center-bottom") {
    return {
      offsetX: Math.round(referenceBbox.centerX - inputBbox.centerX),
      offsetY: Math.round(referenceBbox.bottom - inputBbox.bottom),
    };
  }
  throw new Error(`Unsupported --align: ${align}`);
}

function blendLikePillowPaste(src, srcW, srcH, canvasW, canvasH, offsetX, offsetY) {
  const out = Buffer.alloc(canvasW * canvasH * 4);

  for (let sy = 0; sy < srcH; sy += 1) {
    const dy = sy + offsetY;
    if (dy < 0 || dy >= canvasH) continue;

    for (let sx = 0; sx < srcW; sx += 1) {
      const dx = sx + offsetX;
      if (dx < 0 || dx >= canvasW) continue;

      const srcI = (sy * srcW + sx) * 4;
      const dstI = (dy * canvasW + dx) * 4;
      const mask = src[srcI + 3];
      if (mask === 0) continue;

      // Existing 85-key head-align used PIL Image.paste(img, pos, img) onto a
      // transparent canvas. With an empty destination this premultiplies RGB
      // by alpha and applies the same mask to the alpha channel.
      out[dstI] = Math.floor((src[srcI] * mask + 127) / 255);
      out[dstI + 1] = Math.floor((src[srcI + 1] * mask + 127) / 255);
      out[dstI + 2] = Math.floor((src[srcI + 2] * mask + 127) / 255);
      out[dstI + 3] = Math.floor((src[srcI + 3] * mask + 127) / 255);
    }
  }

  return out;
}

async function main() {
  const { input, output, canvas, offset, reference, align, threshold } = readArgs(process.argv.slice(2));
  const source = await readRgba(input);
  let canvasW;
  let canvasH;
  let offsetX;
  let offsetY;

  if (reference) {
    const ref = await readRgba(reference);
    ({ canvasW, canvasH } = canvas ? parseCanvas(canvas) : { canvasW: ref.width, canvasH: ref.height });
    const inputBbox = alphaBbox(source.data, source.width, source.height, threshold);
    const referenceBbox = alphaBbox(ref.data, ref.width, ref.height, threshold);
    ({ offsetX, offsetY } = deriveOffset(inputBbox, referenceBbox, align));
    console.log(
      `derived offset +${offsetX}+${offsetY} from ${align} threshold=${threshold}% ` +
        `(input bbox=${inputBbox.width}x${inputBbox.height}+${inputBbox.left}+${inputBbox.top}, ` +
        `reference bbox=${referenceBbox.width}x${referenceBbox.height}+${referenceBbox.left}+${referenceBbox.top})`,
    );
  } else {
    if (!canvas) {
      usage();
      process.exit(2);
    }
    ({ canvasW, canvasH } = parseCanvas(canvas));
    ({ offsetX, offsetY } = parseOffset(offset));
  }

  const placed = blendLikePillowPaste(source.data, source.width, source.height, canvasW, canvasH, offsetX, offsetY);

  mkdirSync(dirname(output), { recursive: true });

  if (extname(output).toLowerCase() === ".webp") {
    const tmpPng = `${tmpdir()}/theo-tachie-place-${process.pid}.png`;
    await sharp(placed, {
      raw: { width: canvasW, height: canvasH, channels: 4 },
    }).png().toFile(tmpPng);
    const result = spawnSync("cwebp", ["-q", "85", "-alpha_q", "100", "-m", "6", tmpPng, "-o", output], {
      encoding: "utf8",
    });
    rmSync(tmpPng, { force: true });
    if (result.status !== 0) {
      process.stderr.write(result.stdout);
      process.stderr.write(result.stderr);
      process.exit(result.status ?? 1);
    }
  } else {
    await sharp(placed, {
      raw: { width: canvasW, height: canvasH, channels: 4 },
    }).png().toFile(output);
  }

  console.log(`placed ${input} -> ${output} (${canvasW}x${canvasH} @ +${offsetX}+${offsetY})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
