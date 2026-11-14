export interface SavedLearnProgress {
  startIndex: number;
  cardIndex: number;
  completedCount: number;
  totalCount: number;
  sessionSize: number;
  correct?: number;
  wrongCardIds?: number[];
  reviewCardIds?: number[];
  isReviewing?: boolean;
  roundPassed?: boolean;
  updatedAt: number;
}

export function getLearnProgressStorageKey(id: string) {
  return `quizlet-clone:learn-progress:${id}`;
}

export function getSavedLearnProgress(id: string): SavedLearnProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getLearnProgressStorageKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedLearnProgress> & {
      index?: number;
    };

    const startIndex = parsed.startIndex ?? parsed.index ?? 0;
    const cardIndex = parsed.cardIndex ?? 0;
    const sessionSize = parsed.sessionSize ?? 15;
    const completedCount = parsed.completedCount ?? startIndex + cardIndex;
    const totalCount = parsed.totalCount ?? 0;

    return {
      startIndex,
      cardIndex,
      completedCount,
      totalCount,
      sessionSize,
      correct: parsed.correct ?? 0,
      wrongCardIds: parsed.wrongCardIds ?? [],
      reviewCardIds: parsed.reviewCardIds ?? [],
      isReviewing: parsed.isReviewing ?? false,
      roundPassed: parsed.roundPassed ?? false,
      updatedAt: parsed.updatedAt ?? Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveLearnProgress(id: string, progress: SavedLearnProgress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      getLearnProgressStorageKey(id),
      JSON.stringify(progress),
    );
  } catch (error) {
    console.error("Failed to save learn progress:", error);
  }
}

export function clearLearnProgress(id: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(getLearnProgressStorageKey(id));
  } catch (error) {
    console.error("Failed to clear learn progress:", error);
  }
}
