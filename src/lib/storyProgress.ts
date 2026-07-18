import { getAppStorage, updateAppStorage } from "./appStorage";
import { RESIDENTS } from "../data/residents";

export interface StoryProgress {
  unlockedStoryIds: string[];
  completedStoryIds: string[];
  currentStoryId: string | null;
  disappearedResidents: string[];
  completed: boolean;
}

const RESIDENT_SLUGS = new Set(RESIDENTS.map((resident) => resident.slug));

const DISAPPEARANCE_BY_STORY_ID: Record<string, readonly string[]> = {
  "act2-02": ["spino"],
  "act3-01": ["hegru", "kantia"],
  "act3-02": ["aristo"],
  "act3-04": ["dekaris"],
  "act4-01": ["hue", "ou", "makiya"],
};

export function createInitialStoryProgress(storyIds: readonly string[]): StoryProgress {
  return {
    unlockedStoryIds: storyIds[0] ? [storyIds[0]] : [],
    completedStoryIds: [],
    currentStoryId: storyIds[0] ?? null,
    disappearedResidents: [],
    completed: storyIds.length === 0,
  };
}

export function normalizeStoryProgress(raw: unknown, storyIds: readonly string[]): StoryProgress {
  const known = new Set(storyIds);
  const initial = createInitialStoryProgress(storyIds);
  if (!raw || typeof raw !== "object") return initial;

  const source = raw as Partial<Record<keyof StoryProgress, unknown>>;
  const unlocked = filterKnownStrings(source.unlockedStoryIds, known);
  const completed = filterKnownStrings(source.completedStoryIds, known);

  const unlockedSet = new Set([...initial.unlockedStoryIds, ...unlocked, ...completed]);
  for (const storyId of completed) {
    const next = nextStoryId(storyId, storyIds);
    if (next) unlockedSet.add(next);
  }

  const completedSet = new Set(completed);
  const allCompleted = completedSet.size >= storyIds.length && storyIds.length > 0;
  const current = allCompleted
    ? null
    : typeof source.currentStoryId === "string" && known.has(source.currentStoryId)
      ? source.currentStoryId
      : firstUnreadStoryId(completedSet, storyIds);

  const disappearedResidents = mergeDisappearedResidents(
    source.disappearedResidents,
    completed,
  );

  return {
    unlockedStoryIds: storyIds.filter((id) => unlockedSet.has(id)),
    completedStoryIds: storyIds.filter((id) => completedSet.has(id)),
    currentStoryId: current,
    disappearedResidents,
    completed: allCompleted,
  };
}

export function completeStoryEntryInProgress(
  progress: StoryProgress,
  storyId: string,
  storyIds: readonly string[],
): StoryProgress {
  if (!storyIds.includes(storyId)) return normalizeStoryProgress(progress, storyIds);

  const completed = new Set(progress.completedStoryIds);
  completed.add(storyId);

  const unlocked = new Set(progress.unlockedStoryIds);
  unlocked.add(storyId);
  const next = nextStoryId(storyId, storyIds);
  if (next) unlocked.add(next);

  const completedSet = new Set(storyIds.filter((id) => completed.has(id)));
  const completedStoryIds = storyIds.filter((id) => completed.has(id));
  return {
    ...progress,
    unlockedStoryIds: storyIds.filter((id) => unlocked.has(id)),
    completedStoryIds,
    currentStoryId: next ?? firstUnreadStoryId(completedSet, storyIds),
    disappearedResidents: mergeDisappearedResidents(progress.disappearedResidents, completedStoryIds),
    completed: completedSet.size >= storyIds.length && storyIds.length > 0,
  };
}

/**
 * `/story` で表示すべき本編ボタンの storyId 集合（＝読了済み＋次の1つ）を、
 * 元の並び順を保ったまま返す。未解放は非表示（見せない）ので unlocked のみ。
 */
export function selectVisibleStoryIds(
  storyIds: readonly string[],
  unlockedStoryIds: readonly string[],
): string[] {
  const unlocked = new Set(unlockedStoryIds);
  return storyIds.filter((id) => unlocked.has(id));
}

/**
 * 幕見出しセクションを表示するか。配下ボタンに表示（unlocked）が1つでもあれば true。
 * 1つも無ければ見出しごと非表示にする。
 */
export function isStorySectionVisible(
  sectionStoryIds: readonly string[],
  unlockedStoryIds: readonly string[],
): boolean {
  const unlocked = new Set(unlockedStoryIds);
  return sectionStoryIds.some((id) => unlocked.has(id));
}

export function getStoryProgress(storyIds: readonly string[]): StoryProgress {
  return normalizeStoryProgress(getAppStorage().storyProgress, storyIds);
}

export function getStoredDisappearedResidents(): string[] {
  const raw = getAppStorage().storyProgress;
  if (!raw || typeof raw !== "object") return [];
  const source = raw as { disappearedResidents?: unknown };
  if (!Array.isArray(source.disappearedResidents)) return [];
  const disappeared = new Set(
    source.disappearedResidents.filter((id): id is string => typeof id === "string" && RESIDENT_SLUGS.has(id)),
  );
  return RESIDENTS.map((resident) => resident.slug).filter((slug) => disappeared.has(slug));
}

export function saveStoryProgress(progress: StoryProgress): void {
  updateAppStorage((current) => ({
    ...current,
    storyProgress: progress,
  }));
}

export function isStoryEntryUnlocked(storyId: string, storyIds: readonly string[]): boolean {
  return getStoryProgress(storyIds).unlockedStoryIds.includes(storyId);
}

export function completeStoryEntry(storyId: string, storyIds: readonly string[]): StoryProgress {
  const next = completeStoryEntryInProgress(getStoryProgress(storyIds), storyId, storyIds);
  saveStoryProgress(next);
  return next;
}

export function resetStoryProgress(storyIds: readonly string[]): StoryProgress {
  const next = createInitialStoryProgress(storyIds);
  saveStoryProgress(next);
  return next;
}

export function deriveDisappearedResidents(completedStoryIds: readonly string[]): string[] {
  const disappeared = new Set<string>();
  for (const storyId of completedStoryIds) {
    for (const resident of DISAPPEARANCE_BY_STORY_ID[storyId] ?? []) {
      disappeared.add(resident);
    }
  }
  return RESIDENTS.map((resident) => resident.slug).filter((slug) => disappeared.has(slug));
}

function filterKnownStrings(value: unknown, known: Set<string>): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string" && known.has(id));
}

function mergeDisappearedResidents(raw: unknown, completedStoryIds: readonly string[]): string[] {
  const disappeared = new Set(deriveDisappearedResidents(completedStoryIds));
  if (Array.isArray(raw)) {
    for (const id of raw) {
      if (typeof id === "string" && RESIDENT_SLUGS.has(id)) disappeared.add(id);
    }
  }
  return RESIDENTS.map((resident) => resident.slug).filter((slug) => disappeared.has(slug));
}

function nextStoryId(storyId: string, storyIds: readonly string[]): string | null {
  const index = storyIds.indexOf(storyId);
  return index >= 0 ? (storyIds[index + 1] ?? null) : null;
}

function firstUnreadStoryId(completed: Set<string>, storyIds: readonly string[]): string | null {
  return storyIds.find((id) => !completed.has(id)) ?? null;
}
