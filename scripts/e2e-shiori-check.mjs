// 栞（出典）表示の実ブラウザ検証スクリプト（Issue #173 Phase A・観点24-27）。
//
// CLAUDE.md 規律1（可視/表示の判定は computed style で取る）に従い、
// `getComputedStyle(el).display` で `.th-shiori` の表示/非表示を実ブラウザで確認する。
// vitest の jsdom では `[hidden]{display:none}` の詳細度・実レイアウトを保証できないため、
// この検証は自動テストの代わりではなく安全網（手動/任意実行）として置く。CI には組み込まない。
//
// 実行には `@playwright/test`（本リポの devDependency には未追加。他リポ ear-sky 等と同じ
// 流儀に揃えるなら `npm i -D @playwright/test && npx playwright install chromium` が必要）。
// このセッションでの初回検証は Playwright MCP（ブラウザ常駐・既にインストール済み）で
// 対話的に実施し、以下と同じ4項目を確認済み（結果は PR/セッションノート参照）。
//
// 使い方: npm run dev を別途起動していなくてもよい（本スクリプトが自前で
// `astro dev` を起動し、確認後に停止する）。
//
//   node scripts/e2e-shiori-check.mjs
//
// 対象ページ: /tea-time/temperature/（citation_map.json に配置済み・kantia-アンチノミー）。
// localStorage キーは src/lib/appStorage.ts の APP_STORAGE_KEY="theo-hayami"、
// 完読 slug 形式は current/temperature.md → `tea-temperature`（fileKeyToReaderSlug）。

import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const PORT = 4322;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const PAGE_URL = `${BASE_URL}/tea-time/temperature/`;
const APP_STORAGE_KEY = "theo-hayami";
const READ_SLUG = "tea-temperature";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE_URL, { cache: "no-store" });
      if (res.ok) return;
    } catch {
      // まだ起動中。
    }
    await wait(300);
  }
  throw new Error(`astro dev did not start at ${BASE_URL}`);
}

async function readShioriState(page) {
  return page.evaluate(() => {
    const el = document.querySelector(".th-shiori");
    if (!el) return { found: false };
    const cs = getComputedStyle(el);
    return {
      found: true,
      display: cs.display,
      hiddenAttr: el.hasAttribute("hidden"),
      isLit: el.classList.contains("is-lit"),
    };
  });
}

function assertEqual(label, actual, expected) {
  const ok = actual === expected;
  console.log(`${ok ? "OK" : "NG"} ${label}: actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`);
  if (!ok) process.exitCode = 1;
}

const devServer = spawn(
  "npx",
  ["astro", "dev", "--host", "127.0.0.1", "--port", String(PORT)],
  { stdio: "inherit", cwd: new URL("..", import.meta.url) },
);

let browser;
try {
  await waitForServer();
  browser = await chromium.launch();
  const page = await browser.newPage();

  // #24: 未読で開く → 非表示（実 computed style）。
  await page.goto(PAGE_URL, { waitUntil: "networkidle" });
  const unread = await readShioriState(page);
  assertEqual("#24 未読時 display", unread.display, "none");
  assertEqual("#24 未読時 hidden属性", unread.hiddenAttr, true);

  // #25: 既読を localStorage に書いてリロード → 表示 + is-lit
  //（ReaderFrame の origin 検証を postMessage で本物どおりに満たすのは同一ページ内では
  //  不可能なため、README/観点どおり localStorage 直接書き込みで代替する）。
  await page.evaluate(
    ({ key, slug }) => {
      localStorage.setItem(key, JSON.stringify({ read: { completedSlugs: [slug] } }));
    },
    { key: APP_STORAGE_KEY, slug: READ_SLUG },
  );
  await page.reload({ waitUntil: "networkidle" });
  const revealed = await readShioriState(page);
  assertEqual("#25 既読後 display", revealed.display, "block");
  assertEqual("#25 既読後 is-lit", revealed.isLit, true);

  // #26: もう一度リロードしても表示が続く（localStorage 永続）。
  await page.reload({ waitUntil: "networkidle" });
  const persisted = await readShioriState(page);
  assertEqual("#26 再リロード後 display", persisted.display, "block");
  assertEqual("#26 再リロード後 is-lit", persisted.isLit, true);

  // #27: localStorage を消した別コンテキスト相当（クリア→リロード）→ 非表示に戻る。
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  const cleared = await readShioriState(page);
  assertEqual("#27 localStorage消去後 display", cleared.display, "none");
  assertEqual("#27 localStorage消去後 hidden属性", cleared.hiddenAttr, true);
} finally {
  await browser?.close();
  devServer.kill();
}
