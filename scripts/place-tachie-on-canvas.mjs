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
    --canvas <width>x<height> \\
    --offset <x>,<y>

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
  for (const key of ["input", "output", "canvas", "offset"]) {
    if (!args[key]) {
      usage();
      process.exit(2);
    }
  }
  const canvas = args.canvas.match(/^(\d+)x(\d+)$/);
  const offset = args.offset.match(/^(-?\d+),(-?\d+)$/);
  if (!canvas || !offset) {
    usage();
    process.exit(2);
  }
  return {
    input: args.input,
    output: args.output,
    canvasW: Number(canvas[1]),
    canvasH: Number(canvas[2]),
    offsetX: Number(offset[1]),
    offsetY: Number(offset[2]),
  };
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
  const { input, output, canvasW, canvasH, offsetX, offsetY } = readArgs(process.argv.slice(2));

  const source = sharp(input).ensureAlpha();
  const meta = await source.metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`Cannot read image dimensions: ${input}`);
  }

  const src = await source.raw().toBuffer();
  const placed = blendLikePillowPaste(src, meta.width, meta.height, canvasW, canvasH, offsetX, offsetY);

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
