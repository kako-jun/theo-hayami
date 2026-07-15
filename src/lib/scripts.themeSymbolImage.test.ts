import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

// themeSymbolImage() は実ファイルの実在（existsSync）だけを根拠に配信パスを返す純粋な
// ゲート関数（Issue #73）。実データでは netami.webp 1件しか無く「無い」分岐が実データだけでは
// 突けないため、node:fs をモックして「ある/無い」双方の分岐と existsSync への実引数を検証する。
// scripts.fallback.test.ts と同じ vi.hoisted + vi.mock("node:fs") パターンを踏襲する。

const fsMock = vi.hoisted(() => ({
  existingSlugs: new Set<string>(),
  existsSyncCalls: [] as string[],
}));

vi.mock("node:fs", () => ({
  existsSync: (p: string) => {
    const filePath = String(p);
    fsMock.existsSyncCalls.push(filePath);
    return [...fsMock.existingSlugs].some(
      (slug) => filePath === path.join(process.cwd(), "assets", "images", "theme-symbols", `${slug}.webp`),
    );
  },
  // themeSymbolImage 単体テストでは呼ばれないが、scripts.ts の import 文（named import 3つ）を
  // 満たすためにモックの形だけ揃えておく。
  readdirSync: () => [],
  readFileSync: () => "",
}));

afterEach(() => {
  fsMock.existingSlugs = new Set();
  fsMock.existsSyncCalls = [];
  vi.resetModules();
});

async function freshScripts() {
  vi.resetModules();
  return import("./scripts.ts");
}

describe("themeSymbolImage", () => {
  it("existsSync が true を返す slug は /images/theme-symbols/{slug}.webp を返す", async () => {
    fsMock.existingSlugs = new Set(["ai"]);
    const { themeSymbolImage } = await freshScripts();
    expect(themeSymbolImage("ai")).toBe("/images/theme-symbols/ai.webp");
  });

  it("existsSync が false を返す slug は null（画像が無い業はデグレせず無地のまま）", async () => {
    fsMock.existingSlugs = new Set(); // 何も存在しない
    const { themeSymbolImage } = await freshScripts();
    expect(themeSymbolImage("shi")).toBeNull();
  });

  it("空文字 slug は null（ファイル名 '.webp' を存在扱いしない）", async () => {
    fsMock.existingSlugs = new Set();
    const { themeSymbolImage } = await freshScripts();
    expect(themeSymbolImage("")).toBeNull();
  });

  it("existsSync には THEME_SYMBOLS_DIR/{slug}.webp 形のパスが渡る（ディレクトリを取り違えない）", async () => {
    fsMock.existingSlugs = new Set(["ai"]);
    const { themeSymbolImage } = await freshScripts();
    themeSymbolImage("ai");
    expect(fsMock.existsSyncCalls).toHaveLength(1);
    const calledPath = fsMock.existsSyncCalls[0] ?? "";
    expect(calledPath).toBe(path.join(process.cwd(), "assets", "images", "theme-symbols", "ai.webp"));
  });
});
