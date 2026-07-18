import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { APP_STORAGE_KEY } from "./appStorage";
import { groupStoryButtonsByAct, loadStoryButtons } from "./scripts";
import {
  completeStoryEntry,
  completeStoryEntryInProgress,
  createInitialStoryProgress,
  deriveDisappearedResidents,
  getStoredDisappearedResidents,
  getStoryProgress,
  isStorySectionVisible,
  normalizeStoryProgress,
  selectVisibleStoryIds,
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

  it("本編完了時は消失住人フラグを解除する", () => {
    const progress = normalizeStoryProgress(
      {
        unlockedStoryIds: [...STORY_IDS],
        completedStoryIds: ["ohako-aristo", "ohako-kantia"],
        disappearedResidents: ["spino"],
      },
      STORY_IDS,
    );
    const next = completeStoryEntryInProgress(progress, "ohako-hegru", STORY_IDS);
    expect(next.completed).toBe(true);
    expect(next.disappearedResidents).toEqual([]);
  });

  it("全読了済みの保存値は古い currentStoryId があっても null に正規化する", () => {
    const progress = normalizeStoryProgress(
      {
        unlockedStoryIds: [...STORY_IDS],
        completedStoryIds: [...STORY_IDS],
        currentStoryId: "ohako-aristo",
        disappearedResidents: ["spino"],
      },
      STORY_IDS,
    );
    expect(progress.completed).toBe(true);
    expect(progress.currentStoryId).toBeNull();
    expect(progress.disappearedResidents).toEqual([]);
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

describe("storyProgress: 第一幕〜第四幕24件の順序ゲート回帰（id数非依存）", () => {
  const STORY_IDS = loadStoryButtons().map((entry) => entry.slug);

  it("24件でも初期状態は先頭（act1-01）のみ解放", () => {
    expect(STORY_IDS.length).toBe(24);
    const initial = createInitialStoryProgress(STORY_IDS);
    expect(initial.unlockedStoryIds).toEqual(["act1-01"]);
    expect(initial.currentStoryId).toBe("act1-01");
    expect(initial.completed).toBe(false);
  });

  it("先頭から順に読了すると1件ずつ次だけが解放され、24件目で完了する", () => {
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

describe("storyProgress: /story 表示ゲート（未解放は非表示）", () => {
  // 幕集合は本番と同じソース（groupStoryButtonsByAct）から導出する。
  // 第一幕は act1-01..04 に加えて差し込まれるおはこ8本（slug=ohako-<住人>）を含む
  // 計12件、第二幕は act2-01..04 の4件。id 接頭辞での分割はおはこを取りこぼす。
  const SECTIONS = groupStoryButtonsByAct(loadStoryButtons());
  const STORY_IDS = SECTIONS.flatMap((section) => section.buttons.map((b) => b.slug));
  const ACT1 = SECTIONS[0]!.buttons.map((b) => b.slug);
  const ACT2 = SECTIONS[1]!.buttons.map((b) => b.slug);
  const ACT3 = SECTIONS[2]!.buttons.map((b) => b.slug);
  const ACT4 = SECTIONS[3]!.buttons.map((b) => b.slug);

  it("幕集合は本番の groupStoryButtonsByAct 由来（第一幕はおはこ8本を含む12件）", () => {
    expect(ACT1).toHaveLength(12);
    expect(ACT1).toContain("ohako-aristo");
    expect(ACT1.filter((id) => id.startsWith("ohako-"))).toHaveLength(8);
    expect(ACT2).toEqual(["act2-01", "act2-02", "act2-03", "act2-04"]);
    expect(ACT3).toEqual(["act3-01", "act3-02", "act3-03", "act3-04"]);
    expect(ACT4).toEqual(["act4-01", "act4-02", "act4-03", "act4-04"]);
  });

  it("selectVisibleStoryIds は unlocked のみを元順で返す（未解放は落とす）", () => {
    const unlocked = ["act1-01", "act1-02"];
    expect(selectVisibleStoryIds(STORY_IDS, unlocked)).toEqual(["act1-01", "act1-02"]);
  });

  it("初期状態は第一幕01だけ表示・第二幕セクションは非表示", () => {
    const { unlockedStoryIds } = createInitialStoryProgress(STORY_IDS);
    expect(selectVisibleStoryIds(STORY_IDS, unlockedStoryIds)).toEqual(["act1-01"]);
    expect(isStorySectionVisible(ACT1, unlockedStoryIds)).toBe(true);
    expect(isStorySectionVisible(ACT2, unlockedStoryIds)).toBe(false);
  });

  it("第一幕を全読了すると第二幕01が表示され第二幕セクションが可視化する", () => {
    let progress = createInitialStoryProgress(STORY_IDS);
    for (const id of ACT1) progress = completeStoryEntryInProgress(progress, id, STORY_IDS);
    const visible = selectVisibleStoryIds(STORY_IDS, progress.unlockedStoryIds);
    expect(visible).toContain("act2-01");
    expect(visible).not.toContain("act2-02");
    expect(isStorySectionVisible(ACT2, progress.unlockedStoryIds)).toBe(true);
  });
});

describe("storyProgress: 消失住人フラグ", () => {
  const STORY_IDS = loadStoryButtons().map((entry) => entry.slug);

  beforeEach(() => installStorage(makeStorage()));

  it("本編読了IDから消失住人を RESIDENTS 順で導出する", () => {
    expect(deriveDisappearedResidents(["act2-02", "act3-01", "act4-01"])).toEqual([
      "kantia",
      "hegru",
      "spino",
      "hue",
      "makiya",
      "ou",
    ]);
  });

  it("該当本編を完了すると storyProgress.disappearedResidents に保存される", () => {
    let progress = createInitialStoryProgress(STORY_IDS);
    for (const id of STORY_IDS.slice(0, STORY_IDS.indexOf("act2-02") + 1)) {
      progress = completeStoryEntryInProgress(progress, id, STORY_IDS);
    }
    expect(progress.disappearedResidents).toEqual(["spino"]);
  });

  it("保存済みの消失住人だけをクライアントUI用に返す", () => {
    completeStoryEntry("act1-01", STORY_IDS);
    let progress = getStoryProgress(STORY_IDS);
    progress = completeStoryEntryInProgress(progress, "act2-02", STORY_IDS);
    installStorage(
      makeStorage({
        [APP_STORAGE_KEY]: JSON.stringify({ storyProgress: progress }),
      }),
    );
    expect(getStoredDisappearedResidents()).toEqual(["spino"]);
  });

  it("本編完了済みの保存値ではクライアントUI用の消失住人を返さない", () => {
    installStorage(
      makeStorage({
        [APP_STORAGE_KEY]: JSON.stringify({
          storyProgress: {
            unlockedStoryIds: [...STORY_IDS],
            completedStoryIds: [...STORY_IDS],
            currentStoryId: null,
            disappearedResidents: ["spino"],
            completed: true,
          },
        }),
      }),
    );
    expect(getStoredDisappearedResidents()).toEqual([]);
  });
});
