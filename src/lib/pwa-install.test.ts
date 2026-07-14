import { afterEach, describe, expect, it, vi } from "vitest";
import { getInstallDismissed, setInstallDismissed, shouldShowInstallPrompt } from "./pwa-install.ts";

// getInstallDismissed/setInstallDismissed は localStorage しか触らないクライアント専用ストア
// （readStore.test.ts と同じ最小 in-memory localStorage を差し込むパターン）。
// shouldShowInstallPrompt は DOM/ブラウザAPIを含まない純粋関数なので node 環境でそのままテストできる
// （pwa-update.test.ts の shouldSkipUpdate と同じ方針）。

const STORAGE_KEY = "theo-hayami:pwa-install-dismissed";

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

/** setItem すると常に例外を投げる localStorage（quota超過相当）。 */
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

describe("getInstallDismissed", () => {
  it("localStorage 未対応環境なら false", () => {
    installStorage(undefined);
    expect(getInstallDismissed()).toBe(false);
  });

  it("未記録（getItem が null を返す）なら false", () => {
    installStorage(makeStorage());
    expect(getInstallDismissed()).toBe(false);
  });

  it("\"1\" が保存されていれば true", () => {
    installStorage(makeStorage({ [STORAGE_KEY]: "1" }));
    expect(getInstallDismissed()).toBe(true);
  });

  it("\"1\" 以外の値（壊れた/古い形式）は false（例: \"0\", \"true\", 空文字）", () => {
    installStorage(makeStorage({ [STORAGE_KEY]: "0" }));
    expect(getInstallDismissed()).toBe(false);

    installStorage(makeStorage({ [STORAGE_KEY]: "true" }));
    expect(getInstallDismissed()).toBe(false);

    installStorage(makeStorage({ [STORAGE_KEY]: "" }));
    expect(getInstallDismissed()).toBe(false);
  });
});

describe("setInstallDismissed", () => {
  it("localStorage 未対応環境では例外を投げず no-op", () => {
    installStorage(undefined);
    expect(() => setInstallDismissed()).not.toThrow();
  });

  it("setItem が成功する場合、\"1\" が保存される", () => {
    const storage = makeStorage();
    installStorage(storage);
    setInstallDismissed();
    expect(storage.getItem(STORAGE_KEY)).toBe("1");
  });

  it("setItem が例外を投げても（quota超過相当）握りつぶし、console.error 等でログ汚染しない", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    installStorage(makeThrowingStorage());

    expect(() => setInstallDismissed()).not.toThrow();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
    warnSpy.mockRestore();
    logSpy.mockRestore();
  });
});

describe("setInstallDismissed / getInstallDismissed の往復", () => {
  it("setInstallDismissed() 後に getInstallDismissed() は true（round-trip）", () => {
    installStorage(makeStorage());
    expect(getInstallDismissed()).toBe(false);
    setInstallDismissed();
    expect(getInstallDismissed()).toBe(true);
  });
});

describe("shouldShowInstallPrompt", () => {
  it("canInstall が false なら、他が表示可能な組み合わせでも常に false（R1）", () => {
    expect(shouldShowInstallPrompt(false, false, false)).toBe(false);
  });

  it("canInstall が true でも isStandalone が true なら false（インストール済みは出さない・R2）", () => {
    expect(shouldShowInstallPrompt(true, true, false)).toBe(false);
  });

  it("canInstall が true でも isDismissed が true なら false（却下済みは再表示しない・R3）", () => {
    expect(shouldShowInstallPrompt(true, false, true)).toBe(false);
  });

  it("canInstall が true・isStandalone が false・isDismissed が false なら true（表示する・R4）", () => {
    expect(shouldShowInstallPrompt(true, false, false)).toBe(true);
  });

  it("isStandalone と isDismissed が両方 true でも canInstall が false なら false（R1の優先確認）", () => {
    expect(shouldShowInstallPrompt(false, true, true)).toBe(false);
  });
});
