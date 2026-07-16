import { getAppStorage, updateAppStorage } from "./appStorage";

export interface StoryProgress {
  unlockedStoryIds: string[];
  completedStoryIds: string[];
  currentStoryId: string | null;
  disappearedResidents: string[];
  completed: boolean;
}

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

  return {
    unlockedStoryIds: storyIds.filter((id) => unlockedSet.has(id)),
    completedStoryIds: storyIds.filter((id) => completedSet.has(id)),
    currentStoryId: current,
    disappearedResidents: Array.isArray(source.disappearedResidents)
      ? source.disappearedResidents.filter((id): id is string => typeof id === "string")
      : [],
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
  return {
    ...progress,
    unlockedStoryIds: storyIds.filter((id) => unlocked.has(id)),
    completedStoryIds: storyIds.filter((id) => completed.has(id)),
    currentStoryId: next ?? firstUnreadStoryId(completedSet, storyIds),
    completed: completedSet.size >= storyIds.length && storyIds.length > 0,
  };
}

export function getStoryProgress(storyIds: readonly string[]): StoryProgress {
  return normalizeStoryProgress(getAppStorage().storyProgress, storyIds);
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

function filterKnownStrings(value: unknown, known: Set<string>): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string" && known.has(id));
}

function nextStoryId(storyId: string, storyIds: readonly string[]): string | null {
  const index = storyIds.indexOf(storyId);
  return index >= 0 ? (storyIds[index + 1] ?? null) : null;
}

function firstUnreadStoryId(completed: Set<string>, storyIds: readonly string[]): string | null {
  return storyIds.find((id) => !completed.has(id)) ?? null;
}
