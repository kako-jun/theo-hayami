import { afterEach, describe, expect, it, vi } from "vitest";
import { PWA_UPDATE_COOLDOWN_MS, getLastUpdateAt, recordUpdateAt, shouldSkipUpdate } from "./pwa-update.ts";

// shouldSkipUpdate は PWA 更新 overlay の reload loop 防止 cooldown 判定（純粋関数）。
// sessionStorage I/O やタイマーは含まないため node 環境でそのままテストできる。
// getLastUpdateAt / recordUpdateAt は sessionStorage I/O を持つので、readStore.test.ts と同じ
// パターンで最小の in-memory sessionStorage を差し込んでテストする。

const STORAGE_KEY = "theo-hayami:pwa-update-at";

/** 最小の sessionStorage 互換（getItem/setItem だけ使う）。 */
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

/** setItem すると常に例外を投げる sessionStorage（quota超過相当）。 */
function makeThrowingStorage(): Storage {
  return {
    getItem: () => null,
    setItem: () => {
      throw new Error("QuotaExceededError");
    },
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  } as Storage;
}

function installStorage(storage: Storage | undefined): void {
  if (storage === undefined) {
    // @ts-expect-error テストのため sessionStorage を未定義に戻す（typeof ガードの検証）。
    delete globalThis.sessionStorage;
  } else {
    Object.defineProperty(globalThis, "sessionStorage", {
      value: storage,
      configurable: true,
      writable: true,
    });
  }
}

afterEach(() => {
  installStorage(undefined);
});

describe("shouldSkipUpdate", () => {
  it("lastUpdateAt が null（未記録・初回）なら false（R1: 初回は必ず反映）", () => {
    expect(shouldSkipUpdate(null, Date.now(), PWA_UPDATE_COOLDOWN_MS)).toBe(false);
  });

  it("経過時間が cooldownMs - 1（境界-1）なら true（R2: cooldown内側ぎりぎり）", () => {
    const now = 1_000_000;
    const lastUpdateAt = now - (PWA_UPDATE_COOLDOWN_MS - 1);
    expect(shouldSkipUpdate(lastUpdateAt, now, PWA_UPDATE_COOLDOWN_MS)).toBe(true);
  });

  it("経過時間が cooldownMs ちょうど（境界）なら false（R3: < と <= の取り違え検出）", () => {
    const now = 1_000_000;
    const lastUpdateAt = now - PWA_UPDATE_COOLDOWN_MS;
    expect(shouldSkipUpdate(lastUpdateAt, now, PWA_UPDATE_COOLDOWN_MS)).toBe(false);
  });

  it("経過時間が cooldownMs + 1（境界+1）なら false（R4: cooldown完全超過）", () => {
    const now = 1_000_000;
    const lastUpdateAt = now - (PWA_UPDATE_COOLDOWN_MS + 1);
    expect(shouldSkipUpdate(lastUpdateAt, now, PWA_UPDATE_COOLDOWN_MS)).toBe(false);
  });

  it("now が lastUpdateAt より前（経過時間が負・時計スキュー相当）なら true（R5）", () => {
    const lastUpdateAt = 1_000_000;
    const now = lastUpdateAt - 500;
    expect(shouldSkipUpdate(lastUpdateAt, now, PWA_UPDATE_COOLDOWN_MS)).toBe(true);
  });

  it("経過時間が 0（同ミリ秒内に onNeedRefresh が連続発火）なら true", () => {
    const now = 1_000_000;
    expect(shouldSkipUpdate(now, now, PWA_UPDATE_COOLDOWN_MS)).toBe(true);
  });
});

describe("getLastUpdateAt", () => {
  it("sessionStorage 未対応環境なら null", () => {
    installStorage(undefined);
    expect(getLastUpdateAt()).toBeNull();
  });

  it("未記録（getItem が null を返す）なら null", () => {
    installStorage(makeStorage());
    expect(getLastUpdateAt()).toBeNull();
  });

  it("空文字が保存されていれば null（!raw 分岐）", () => {
    installStorage(makeStorage({ [STORAGE_KEY]: "" }));
    expect(getLastUpdateAt()).toBeNull();
  });

  it("非数値文字列（例: \"abc\"）は NaN として null（Number.isFinite ガード）", () => {
    installStorage(makeStorage({ [STORAGE_KEY]: "abc" }));
    expect(getLastUpdateAt()).toBeNull();
  });

  it("\"Infinity\" は Number() が有限値を返さないため null", () => {
    installStorage(makeStorage({ [STORAGE_KEY]: "Infinity" }));
    expect(getLastUpdateAt()).toBeNull();
  });

  it("\"0\" は偽値だが有効なタイムスタンプとして 0 を返す", () => {
    installStorage(makeStorage({ [STORAGE_KEY]: "0" }));
    expect(getLastUpdateAt()).toBe(0);
  });

  it("正常な数値文字列は対応する数値を返す", () => {
    installStorage(makeStorage({ [STORAGE_KEY]: "1700000000000" }));
    expect(getLastUpdateAt()).toBe(1700000000000);
  });
});

describe("recordUpdateAt", () => {
  it("sessionStorage 未対応環境では例外を投げず no-op", () => {
    installStorage(undefined);
    expect(() => recordUpdateAt(1_000_000)).not.toThrow();
  });

  it("setItem が成功する場合、渡した値の String(now) が保存される", () => {
    const storage = makeStorage();
    installStorage(storage);
    recordUpdateAt(1_700_000_000_000);
    expect(storage.getItem(STORAGE_KEY)).toBe("1700000000000");
  });

  it("setItem が例外を投げても（quota超過相当）握りつぶし、console.error 等でログ汚染しない", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    installStorage(makeThrowingStorage());

    expect(() => recordUpdateAt(1_000_000)).not.toThrow();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
    warnSpy.mockRestore();
    logSpy.mockRestore();
  });
});

describe("recordUpdateAt / getLastUpdateAt / shouldSkipUpdate の往復・組み合わせ", () => {
  it("recordUpdateAt(t) 後に getLastUpdateAt() すると同じ t が返る（round-trip）", () => {
    installStorage(makeStorage());
    const t = 1_700_000_000_000;
    recordUpdateAt(t);
    expect(getLastUpdateAt()).toBe(t);
  });

  it("recordUpdateAt(t) 直後の再発火（t+1）は shouldSkipUpdate が true（二重送信/再実行防止）", () => {
    installStorage(makeStorage());
    const t = 1_700_000_000_000;
    recordUpdateAt(t);
    expect(shouldSkipUpdate(getLastUpdateAt(), t + 1, PWA_UPDATE_COOLDOWN_MS)).toBe(true);
  });

  it("recordUpdateAt(t) から cooldown 経過後は shouldSkipUpdate が false（cooldown明けの反映）", () => {
    installStorage(makeStorage());
    const t = 1_700_000_000_000;
    recordUpdateAt(t);
    expect(shouldSkipUpdate(getLastUpdateAt(), t + PWA_UPDATE_COOLDOWN_MS + 1, PWA_UPDATE_COOLDOWN_MS)).toBe(
      false,
    );
  });
});
