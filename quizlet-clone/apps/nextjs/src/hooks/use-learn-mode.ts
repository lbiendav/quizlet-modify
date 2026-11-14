import type { MouseEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { RouterOutputs } from "@acme/api";

import { useLearnModeReducer } from "~/hooks/use-learn-mode-reducer";
import {
  clearLearnProgress,
  getSavedLearnProgress,
  saveLearnProgress,
} from "~/lib/learn-progress";
import { api } from "~/trpc/react";

type LearnCards = RouterOutputs["studySet"]["learnCards"];
type LearnCard = LearnCards[number];

const DEFAULT_SESSION_SIZE = 15;
const ANSWER_FEEDBACK_DELAY_MS = 250;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function withUniqueCard(cards: LearnCards, card: LearnCard) {
  if (cards.some(({ id }) => id === card.id)) {
    return cards;
  }

  return [...cards, card];
}

export function useLearnMode(id: string, requestedSessionSize?: number) {
  const utils = api.useUtils();
  const [flashcards] = api.studySet.learnCards.useSuspenseQuery(
    { id },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  const [{ index, correct, disabled }, dispatch] = useLearnModeReducer();
  const [startIndex, setStartIndex] = useState(0);
  const [sessionSize, setSessionSizeState] = useState(DEFAULT_SESSION_SIZE);
  const [wrongCards, setWrongCards] = useState<LearnCards>([]);
  const [reviewCards, setReviewCards] = useState<LearnCards>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [roundPassed, setRoundPassed] = useState(false);
  const [pendingWrongAnswer, setPendingWrongAnswer] = useState<string>();

  const isInitializedRef = useRef(false);
  const totalCount = flashcards.length;

  const clearRoundState = () => {
    setWrongCards([]);
    setReviewCards([]);
    setIsReviewing(false);
    setRoundPassed(false);
    setPendingWrongAnswer(undefined);
  };

  useEffect(() => {
    if (isInitializedRef.current || flashcards.length === 0) {
      return;
    }

    const saved = getSavedLearnProgress(id);

    if (!saved) {
      if (requestedSessionSize) {
        setSessionSizeState(
          clamp(requestedSessionSize, 1, Math.max(totalCount, 1)),
        );
      }
      isInitializedRef.current = true;
      return;
    }

    const nextSessionSize = clamp(
      requestedSessionSize ?? saved.sessionSize,
      1,
      Math.max(totalCount, 1),
    );
    const nextStartIndex = clamp(saved.startIndex, 0, totalCount);
    const nextCardIndex = clamp(saved.cardIndex, 0, nextSessionSize);

    setStartIndex(nextStartIndex);
    setSessionSizeState(nextSessionSize);

    const wrongIds = saved.wrongCardIds;
    if (wrongIds && wrongIds.length > 0) {
      const restoredWrong = flashcards.filter((c) => wrongIds.includes(c.id));
      setWrongCards(restoredWrong);
    }

    if (saved.reviewCardIds && saved.reviewCardIds.length > 0) {
      const restoredReview = saved.reviewCardIds
        .map((cid) => flashcards.find((c) => c.id === cid))
        .filter((c): c is LearnCard => Boolean(c));
      setReviewCards(restoredReview);
    }

    if (saved.isReviewing) {
      setIsReviewing(true);
    }

    if (saved.roundPassed) {
      setRoundPassed(true);
    }

    dispatch({
      type: "RESTORE",
      index: nextCardIndex,
      correct: saved.correct ?? 0,
    });

    isInitializedRef.current = true;
  }, [dispatch, flashcards, id, requestedSessionSize, totalCount]);

  const sessionFlashcards = useMemo(() => {
    return flashcards.slice(
      startIndex,
      Math.min(startIndex + sessionSize, totalCount),
    );
  }, [flashcards, sessionSize, startIndex, totalCount]);

  const currentCard = isReviewing ? reviewCards[0] : sessionFlashcards[index];

  const answeredInRound =
    roundPassed || isReviewing
      ? sessionFlashcards.length
      : clamp(index, 0, sessionFlashcards.length);
  const unresolvedWrongCount = isReviewing
    ? reviewCards.length
    : wrongCards.length;
  const passedInRound = roundPassed
    ? sessionFlashcards.length
    : clamp(answeredInRound - unresolvedWrongCount, 0, sessionFlashcards.length);

  const completedCount = clamp(startIndex + answeredInRound, 0, totalCount);

  const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;
  const roundCompletedCount = passedInRound;
  const roundProgress =
    sessionFlashcards.length === 0
      ? 0
      : (roundCompletedCount / sessionFlashcards.length) * 100;

  const isCompleted =
    totalCount > 0 &&
    (startIndex >= totalCount || roundPassed);

  // Autosave progress whenever state changes
  useEffect(() => {
    if (!isInitializedRef.current || totalCount === 0) {
      return;
    }

    saveLearnProgress(id, {
      startIndex,
      cardIndex: index,
      completedCount,
      totalCount,
      sessionSize,
      correct,
      wrongCardIds: wrongCards.map((c) => c.id),
      reviewCardIds: reviewCards.map((c) => c.id),
      isReviewing,
      roundPassed,
      updatedAt: Date.now(),
    });
  }, [
    id,
    startIndex,
    index,
    completedCount,
    totalCount,
    sessionSize,
    correct,
    wrongCards,
    reviewCards,
    isReviewing,
    roundPassed,
  ]);

  const continueNextRound = () => {
    const nextIndex = clamp(startIndex + sessionFlashcards.length, 0, totalCount);
    setStartIndex(nextIndex);
    clearRoundState();
    dispatch({ type: "RESET" });
  };

  const advanceCurrentCard = useCallback(
    ({
      isCorrect,
      wrongCardsForRound,
    }: {
      isCorrect: boolean;
      wrongCardsForRound: LearnCards;
    }) => {
      setPendingWrongAnswer(undefined);

      if (isReviewing) {
        if (isCorrect) {
          setReviewCards((cards) => {
            if (!currentCard) {
              return cards;
            }

            const remainingCards = cards.filter(({ id }) => id !== currentCard.id);

            if (remainingCards.length === 0) {
              setIsReviewing(false);
              setRoundPassed(true);
            }

            return remainingCards;
          });
          return;
        }

        setReviewCards((cards) => {
          const [firstCard, ...remainingCards] = cards;

          if (!firstCard || remainingCards.length === 0) {
            return cards;
          }

          return [...remainingCards, firstCard];
        });
        return;
      }

      const isRoundEnd = index + 1 >= sessionFlashcards.length;

      if (isRoundEnd) {
        if (wrongCardsForRound.length > 0) {
          setReviewCards(wrongCardsForRound);
          setIsReviewing(true);
          return;
        }

        setRoundPassed(true);
        return;
      }

      dispatch({ type: "NEXT_CARD" });
    },
    [currentCard, dispatch, index, isReviewing, sessionFlashcards.length],
  );

  const continueAfterWrongAnswer = useCallback(() => {
    if (!pendingWrongAnswer) {
      return;
    }

    advanceCurrentCard({
      isCorrect: false,
      wrongCardsForRound: wrongCards,
    });
  }, [advanceCurrentCard, pendingWrongAnswer, wrongCards]);

  useEffect(() => {
    if (!pendingWrongAnswer) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowRight") {
        return;
      }

      event.preventDefault();
      continueAfterWrongAnswer();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [continueAfterWrongAnswer, pendingWrongAnswer]);

  const chooseAnswer = (idx: number, event: MouseEvent<HTMLDivElement>) => {
    if (pendingWrongAnswer) {
      continueAfterWrongAnswer();
      return;
    }

    if (!currentCard || disabled) {
      return;
    }

    dispatch({ type: "DISABLE" });

    const button = event.currentTarget;
    const selectedAnswer = currentCard.answers[idx];
    const isCorrect = selectedAnswer === currentCard.definition;
    const nextWrongCards =
      isCorrect || isReviewing
        ? wrongCards
        : withUniqueCard(wrongCards, currentCard);

    if (isCorrect) {
      button.style.background = "#bbf7d0";
      button.style.borderColor = "#16a34a";
      dispatch({ type: "MARK_CORRECT" });
    } else {
      if (!isReviewing) {
        setWrongCards(nextWrongCards);
      }
      setPendingWrongAnswer(selectedAnswer);
      dispatch({ type: "ENABLE" });
      return;
    }

    setTimeout(() => {
      button.style.background = "hsla(var(--background))";
      button.style.borderColor = "hsla(var(--input))";
      dispatch({ type: "ENABLE" });
      advanceCurrentCard({
        isCorrect,
        wrongCardsForRound: nextWrongCards,
      });
    }, ANSWER_FEEDBACK_DELAY_MS);
  };

  const reset = async () => {
    await utils.studySet.learnCards.invalidate();
    clearLearnProgress(id);
    setStartIndex(0);
    clearRoundState();
    dispatch({ type: "RESET" });
  };

  return {
    chooseAnswer,
    reset,
    currentCard,
    index,
    progress,
    isCompleted,
    flashcards: sessionFlashcards,
    totalCount,
    completedCount,
    roundCompletedCount,
    roundProgress,
    isReviewing,
    reviewRemainingCount: reviewCards.length,
    wrongCount: wrongCards.length,
    pendingWrongAnswer,
    startIndex,
    sessionSize,
    continueNextRound,
    correct,
  };
}
