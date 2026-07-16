import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { APP_STORAGE_KEY } from "./appStorage.ts";
import { getReadSet, isRead, markRead, readRatioPercent } from "./readStore.ts";

// readStore は localStorage しか触らないクライアント専用ストア。vitest は node 環境なので
// localStorage が無い（→ ガードの検証）。DOM を持ち込まず、最小の in-memory localStorage を
// 差し込んで冪等・破損フォールバック・境界を守る。

/** 最小の localStorage 互換（getItem/setItem だけ使う）。 */
function makeStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => void map.set(k, String(v)),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  } as Storage;
}

function installStorage(storage: Storage | undefined): void {
  if (storage === undefined) {
    // @ts-expect-error テストのため localStorage を未定義に戻す（typeof ガードの検証）。
    delete globalThis.localStorage;
  } else {
    Object.defineProperty(globalThis, "localStorage", {
      value: storage,
      configurable: true,
      writable: true,
    });
  }
}

afterEach(() => {
  installStorage(undefined);
});

describe("localStorage が無い環境（SSR/ビルド時/テスト）", () => {
  beforeEach(() => installStorage(undefined));

  it("getReadSet は空集合、isRead は false、markRead は投げずに no-op", () => {
    expect(getReadSet().size).toBe(0);
    expect(isRead("ai__aristo")).toBe(false);
    expect(() => markRead("ai__aristo")).not.toThrow();
  });
});

describe("markRead / isRead / getReadSet", () => {
  beforeEach(() => installStorage(makeStorage()));

  it("markRead した slug は isRead が true・getReadSet に入る", () => {
    markRead("ai__aristo");
    expect(isRead("ai__aristo")).toBe(true);
    expect(getReadSet().has("ai__aristo")).toBe(true);
  });

  it("未記録の slug は isRead が false", () => {
    markRead("ai__aristo");
    expect(isRead("shi__hugo")).toBe(false);
  });

  it("複数 slug を貯められる", () => {
    markRead("ai__aristo");
    markRead("shi__hugo");
    expect(getReadSet()).toEqual(new Set(["ai__aristo", "shi__hugo"]));
  });

  it("同じ slug を二度 markRead しても重複しない（冪等）", () => {
    markRead("ai__aristo");
    markRead("ai__aristo");
    expect([...getReadSet()]).toEqual(["ai__aristo"]);
  });

  it("空 slug は記録しない", () => {
    markRead("");
    expect(getReadSet().size).toBe(0);
  });

  it("localStorage にはアプリ単一キーの read.completedSlugs として保存される", () => {
    markRead("ai__aristo");
    markRead("shi__hugo");
    const raw = globalThis.localStorage.getItem(APP_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string)).toEqual({ read: { completedSlugs: ["ai__aristo", "shi__hugo"] } });
  });
});

describe("破損データのフォールバック", () => {
  it("JSON として壊れていれば空集合（例外を投げない）", () => {
    installStorage(makeStorage({ [APP_STORAGE_KEY]: "{壊れたJSON" }));
    expect(getReadSet().size).toBe(0);
    expect(isRead("ai__aristo")).toBe(false);
  });

  it("配列でない JSON（オブジェクト等）は空集合", () => {
    installStorage(makeStorage({ [APP_STORAGE_KEY]: '{"read":{"completedSlugs":{"ai__aristo":true}}}' }));
    expect(getReadSet().size).toBe(0);
  });

  it("配列内の非文字列要素は無視して文字列だけ拾う", () => {
    installStorage(makeStorage({ [APP_STORAGE_KEY]: '{"read":{"completedSlugs":["ai__aristo",123,null,"shi__hugo"]}}' }));
    expect(getReadSet()).toEqual(new Set(["ai__aristo", "shi__hugo"]));
  });

  it("破損状態から markRead すると健全な単一キー構造で自己修復する", () => {
    installStorage(makeStorage({ [APP_STORAGE_KEY]: "not-json" }));
    markRead("ai__aristo");
    expect(JSON.parse(globalThis.localStorage.getItem(APP_STORAGE_KEY) as string)).toEqual({
      read: { completedSlugs: ["ai__aristo"] },
    });
  });
});

describe("readRatioPercent", () => {
  it("母数が負でもゼロ除算せず0（境界-1）", () => {
    expect(readRatioPercent(0, -1)).toBe(0);
  });

  it("母数0・完読0は0（ゼロ除算ガードの本丸）", () => {
    expect(readRatioPercent(0, 0)).toBe(0);
  });

  it("母数1・完読0は0、母数1・完読1は100（境界+1）", () => {
    expect(readRatioPercent(0, 1)).toBe(0);
    expect(readRatioPercent(1, 1)).toBe(100);
  });

  it("完読0・母数8は0（未読0%）", () => {
    expect(readRatioPercent(0, 8)).toBe(0);
  });

  it("完読4・母数8は50（途中%）", () => {
    expect(readRatioPercent(4, 8)).toBe(50);
  });

  it("完読数が母数と一致（8/8）すれば100（全読了境界）", () => {
    expect(readRatioPercent(8, 8)).toBe(100);
  });

  it("12.5ちょうどは13に切り上がる（Math.round の丸め方向をロック）", () => {
    expect(readRatioPercent(1, 8)).toBe(13);
  });

  it("完読数が母数を超えても100%にクランプしない（現仕様の固定）", () => {
    // 5/3 * 100 = 166.66...→ Math.round で 167（100 に頭打ちしない）。
    expect(readRatioPercent(5, 3)).toBe(167);
  });

  it("純粋関数：同じ引数を2回渡しても同じ戻り値", () => {
    expect(readRatioPercent(4, 8)).toBe(readRatioPercent(4, 8));
  });
});
