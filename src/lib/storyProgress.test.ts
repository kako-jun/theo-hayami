import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { APP_STORAGE_KEY } from "./appStorage";
import { loadStoryButtons } from "./scripts";
import {
  completeStoryEntry,
  completeStoryEntryInProgress,
  createInitialStoryProgress,
  getStoryProgress,
  normalizeStoryProgress,
} from "./storyProgress";

const STORY_IDS = ["ohako-aristo", "ohako-kantia", "ohako-hegru"] as const;

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

describe("storyProgress", () => {
  it("初期状態では最初の本編ボタンだけを解放する", () => {
    expect(createInitialStoryProgress(STORY_IDS)).toMatchObject({
      unlockedStoryIds: ["ohako-aristo"],
      completedStoryIds: [],
      currentStoryId: "ohako-aristo",
      completed: false,
    });
  });

  it("本編ボタンを読了すると次のボタンを解放する", () => {
    const next = completeStoryEntryInProgress(createInitialStoryProgress(STORY_IDS), "ohako-aristo", STORY_IDS);
    expect(next.unlockedStoryIds).toEqual(["ohako-aristo", "ohako-kantia"]);
    expect(next.completedStoryIds).toEqual(["ohako-aristo"]);
    expect(next.currentStoryId).toBe("ohako-kantia");
    expect(next.completed).toBe(false);
  });

  it("最後の本編ボタンまで読了すると本編完了にする", () => {
    const progress = normalizeStoryProgress(
      {
        unlockedStoryIds: [...STORY_IDS],
        completedStoryIds: ["ohako-aristo", "ohako-kantia"],
      },
      STORY_IDS,
    );
    const next = completeStoryEntryInProgress(progress, "ohako-hegru", STORY_IDS);
    expect(next.completedStoryIds).toEqual([...STORY_IDS]);
    expect(next.completed).toBe(true);
    expect(next.currentStoryId).toBeNull();
  });

  it("全読了済みの保存値は古い currentStoryId があっても null に正規化する", () => {
    const progress = normalizeStoryProgress(
      {
        unlockedStoryIds: [...STORY_IDS],
        completedStoryIds: [...STORY_IDS],
        currentStoryId: "ohako-aristo",
      },
      STORY_IDS,
    );
    expect(progress.completed).toBe(true);
    expect(progress.currentStoryId).toBeNull();
  });

  it("壊れた保存値や未知の本編ボタンを正規化する", () => {
    const progress = normalizeStoryProgress(
      {
        unlockedStoryIds: ["ohako-kantia", "unknown"],
        completedStoryIds: ["ohako-aristo", "missing"],
        currentStoryId: "missing",
      },
      STORY_IDS,
    );
    expect(progress.unlockedStoryIds).toEqual(["ohako-aristo", "ohako-kantia"]);
    expect(progress.completedStoryIds).toEqual(["ohako-aristo"]);
    expect(progress.currentStoryId).toBe("ohako-kantia");
  });
});

describe("storyProgress storage", () => {
  beforeEach(() => installStorage(makeStorage()));

  it("localStorage 未対応環境なら初期状態を返し、保存は no-op", () => {
    installStorage(undefined);
    expect(getStoryProgress(STORY_IDS)).toEqual(createInitialStoryProgress(STORY_IDS));
    expect(() => completeStoryEntry("ohako-aristo", STORY_IDS)).not.toThrow();
  });

  it("本編進捗はアプリ単一キーの storyProgress に保存される", () => {
    completeStoryEntry("ohako-aristo", STORY_IDS);
    const raw = globalThis.localStorage.getItem(APP_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).storyProgress).toMatchObject({
      unlockedStoryIds: ["ohako-aristo", "ohako-kantia"],
      completedStoryIds: ["ohako-aristo"],
      currentStoryId: "ohako-kantia",
      completed: false,
    });
  });

  it("既存の read / pwa 状態を壊さず storyProgress だけを更新する", () => {
    installStorage(
      makeStorage({
        [APP_STORAGE_KEY]: '{"read":{"completedSlugs":["ai__aristo"]},"pwa":{"installDismissed":true}}',
      }),
    );

    completeStoryEntry("ohako-aristo", STORY_IDS);

    expect(JSON.parse(globalThis.localStorage.getItem(APP_STORAGE_KEY) as string)).toMatchObject({
      read: { completedSlugs: ["ai__aristo"] },
      pwa: { installDismissed: true },
      storyProgress: {
        completedStoryIds: ["ohako-aristo"],
      },
    });
  });
});

describe("storyProgress: 第一幕+第二幕16件の順序ゲート回帰（id数非依存）", () => {
  const STORY_IDS = loadStoryButtons().map((entry) => entry.slug);

  it("16件でも初期状態は先頭（act1-01）のみ解放", () => {
    expect(STORY_IDS.length).toBe(16);
    const initial = createInitialStoryProgress(STORY_IDS);
    expect(initial.unlockedStoryIds).toEqual(["act1-01"]);
    expect(initial.currentStoryId).toBe("act1-01");
    expect(initial.completed).toBe(false);
  });

  it("先頭から順に読了すると1件ずつ次だけが解放され、16件目で完了する", () => {
    let progress = createInitialStoryProgress(STORY_IDS);
    for (let i = 0; i < STORY_IDS.length; i++) {
      const id = STORY_IDS[i]!;
      // 読了前は i+1 件が解放済み（現在地まで）。
      expect(progress.unlockedStoryIds).toEqual(STORY_IDS.slice(0, i + 1));
      progress = completeStoryEntryInProgress(progress, id, STORY_IDS);
    }
    expect(progress.completedStoryIds).toEqual(STORY_IDS);
    expect(progress.completed).toBe(true);
    expect(progress.currentStoryId).toBeNull();
  });
});
