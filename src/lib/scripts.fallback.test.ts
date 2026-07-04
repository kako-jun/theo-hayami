import { afterEach, describe, expect, it, vi } from "vitest";

// loadEpisodes 内の「ファイル名規約 throw」と「sceneId 2段フォールバック」は実データでは
// 発火しない（実 free/*.md は全て規約合致・見出しあり）。安全に境界を突くため node:fs を
// モックし、規約違反ファイル名や見出し欠損ファイルを注入して分岐だけを検証する。実ファイルには触れない。

const fsMock = vi.hoisted(() => ({
  files: [] as string[],
  contents: {} as Record<string, string>,
}));

vi.mock("node:fs", () => ({
  readdirSync: () => fsMock.files,
  readFileSync: (p: string) => {
    const base = String(p).split("/").pop() ?? "";
    return fsMock.contents[base] ?? "";
  },
}));

afterEach(() => {
  fsMock.files = [];
  fsMock.contents = {};
  vi.resetModules();
});

/** cachedEpisodes を毎回リセットして新鮮な loadEpisodes を得る。 */
async function freshScripts() {
  vi.resetModules();
  return import("./scripts.ts");
}

describe("loadEpisodes: ファイル名規約 業__住人.md", () => {
  it("`__` を含まないファイル名は throw する", async () => {
    fsMock.files = ["nobreak.md"];
    fsMock.contents = { "nobreak.md": "## x-y: z\n" };
    const { loadEpisodes } = await freshScripts();
    expect(() => loadEpisodes()).toThrow(/ファイル名規約/);
  });

  it("業スラッグが空（`__aristo.md`）は throw する", async () => {
    fsMock.files = ["__aristo.md"];
    fsMock.contents = { "__aristo.md": "## a-b: c\n" };
    const { loadEpisodes } = await freshScripts();
    expect(() => loadEpisodes()).toThrow(/ファイル名規約/);
  });

  it("住人スラッグが空（`ai__.md`）は throw する", async () => {
    fsMock.files = ["ai__.md"];
    fsMock.contents = { "ai__.md": "## a-b: c\n" };
    const { loadEpisodes } = await freshScripts();
    expect(() => loadEpisodes()).toThrow(/ファイル名規約/);
  });

  it("3セグメント（`a__b__c.md`）は先頭2つに丸めず throw する", async () => {
    fsMock.files = ["a__b__c.md"];
    fsMock.contents = { "a__b__c.md": "## b-a: x\n" };
    const { loadEpisodes } = await freshScripts();
    expect(() => loadEpisodes()).toThrow(/ファイル名規約/);
  });
});

describe("loadEpisodes: sceneId の2段フォールバック", () => {
  it("見出しが無いとき `${character}-${theme}` に落ちる（?? '' → || フォールバック）", async () => {
    fsMock.files = ["ai__aristo.md"];
    fsMock.contents = { "ai__aristo.md": '---\ntitle: "愛"\n---\n\n見出しの無い本文\n' };
    const { loadEpisodes } = await freshScripts();
    // parseSceneId が "" を返し、loadEpisodes が character-theme を合成する。
    expect(loadEpisodes()[0]?.sceneId).toBe("aristo-ai");
  });

  it("見出しがあればそちらを優先（フォールバックより見出しが正）", async () => {
    fsMock.files = ["ai__aristo.md"];
    fsMock.contents = {
      "ai__aristo.md": '---\ntitle: "愛"\n---\n\n## custom-scene: 任意\n',
    };
    const { loadEpisodes } = await freshScripts();
    // フォールバック候補 "aristo-ai" ではなく、見出しの "custom-scene" が採用される。
    expect(loadEpisodes()[0]?.sceneId).toBe("custom-scene");
  });
});
