import { describe, expect, it } from "vitest";
import {
  completeStoryEntryInProgress,
  createInitialStoryProgress,
  normalizeStoryProgress,
} from "./storyProgress";

const STORY_IDS = ["ohako-aristo", "ohako-kantia", "ohako-hegru"] as const;

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
