// src/lib/citations.ts の追加観点（Issue #173）。
//
// 既存の src/lib/citations.test.ts は実データ（docs/05_philosophy/*.json）だけを対象にしており、
// 実データでは「1slugに配置2件」「section 空の栞」のケースが無い（citation_map.json は
// 現状どちらのファイルも配置1件のみ）。この2点はフィクスチャに差し替えないと検証できないため、
// scripts.fallback.test.ts と同じ流儀で node:fs をモックし、citations.ts をフレッシュに読み直す。
import { afterEach, describe, expect, it, vi } from "vitest";

const fsMock = vi.hoisted(() => ({
  citations: [] as unknown[],
  citationMap: {} as Record<string, unknown>,
}));

vi.mock("node:fs", () => ({
  readFileSync: (p: string) => {
    const s = String(p);
    if (s.endsWith("citation_map.json")) return JSON.stringify(fsMock.citationMap);
    if (s.endsWith("citations.json")) return JSON.stringify(fsMock.citations);
    throw new Error(`unexpected readFileSync path in test: ${s}`);
  },
}));

afterEach(() => {
  fsMock.citations = [];
  fsMock.citationMap = {};
  vi.resetModules();
});

async function freshCitations() {
  vi.resetModules();
  return import("./citations.ts");
}

describe("getCitationsForSlug: 1ファイル2配置", () => {
  it("配置順（citation_map.json の並び順）どおりの配列を返す", async () => {
    fsMock.citations = [
      { id: "id-1", resident: "R", concept: "c1", work: "著作1", section: "", also: [], reading: "いち", raw: "" },
      { id: "id-2", resident: "R", concept: "c2", work: "著作2", section: "", also: [], reading: "に", raw: "" },
    ];
    fsMock.citationMap = {
      "main/two-shiori.md": [
        { after_block: 1, id: "id-1" },
        { after_block: 5, id: "id-2" },
      ],
    };
    const { getCitationsForSlug } = await freshCitations();
    const result = getCitationsForSlug("two-shiori");
    expect(result.map((c) => c.id)).toEqual(["id-1", "id-2"]);
  });
});

describe("formatCitation: section の有無による形式", () => {
  it("非空 section は `『work（reading）』section` になり末尾に空白が付かない", async () => {
    fsMock.citations = [
      {
        id: "id-1",
        resident: "R",
        concept: "c",
        work: "純粋理性批判",
        section: "Ζ・Η",
        also: [],
        reading: "じゅんすいりせいひはん",
        raw: "",
      },
    ];
    fsMock.citationMap = { "main/x.md": [{ after_block: 1, id: "id-1" }] };
    const { getCitationsForSlug, formatCitation } = await freshCitations();
    const [c] = getCitationsForSlug("x");
    expect(formatCitation(c!)).toBe("『純粋理性批判（じゅんすいりせいひはん）』Ζ・Η");
    expect(formatCitation(c!).endsWith(" ")).toBe(false);
  });

  it("空 section は `『work（reading）』` だけになる", async () => {
    fsMock.citations = [
      {
        id: "id-1",
        resident: "R",
        concept: "c",
        work: "エチカ",
        section: "",
        also: [],
        reading: "えちか",
        raw: "",
      },
    ];
    fsMock.citationMap = { "main/x.md": [{ after_block: 1, id: "id-1" }] };
    const { getCitationsForSlug, formatCitation } = await freshCitations();
    const [c] = getCitationsForSlug("x");
    expect(formatCitation(c!)).toBe("『エチカ（えちか）』");
  });
});

describe("fileKeyToReaderSlug: 不正キー", () => {
  it("未知の1階層目（未知ディレクトリ）は null", async () => {
    const { fileKeyToReaderSlug } = await freshCitations();
    expect(fileKeyToReaderSlug("archive/old.md")).toBe(null);
  });

  it("スラッシュを含まないキー（拡張子どころかディレクトリ区切りも無い）は null", async () => {
    const { fileKeyToReaderSlug } = await freshCitations();
    expect(fileKeyToReaderSlug("temperature.md")).toBe(null);
  });

  // レビュー指摘（#173テスト設計）: 拡張子が無いキー・二重スラッシュのキーは、実運用では
  // citation_map.json の値が常に実在する `dir/file.md` の形（他テストで担保済み）なので
  // 発生しないが、fileKeyToReaderSlug 単体は現状これらを弾かない（既知ディレクトリ名が
  // 前半に来ると、拡張子が無くても・区切りが二重でも非 null の slug を返してしまう）。
  // 直さず記録のみ残す（呼び出し元は常に実在パスなので実害は今のところ無い）。
  it.todo(
    "拡張子なしキー（例: `main/foo`）は null になるべきだが、現状は `foo` を返してしまう（実装バグ疑い・未修正）",
  );
  it.todo(
    "二重スラッシュキー（例: `main//foo.md`）は null になるべきだが、現状は `/foo` を返してしまう（実装バグ疑い・未修正）",
  );
});
