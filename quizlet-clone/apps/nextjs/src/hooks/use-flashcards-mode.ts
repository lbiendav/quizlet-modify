"use client";

import { useCallback, useEffect, useState } from "react";
import { useAnimate } from "framer-motion";

import { api } from "~/trpc/react";
import { useFlashcardsModeReducer } from "./use-flashcards-mode-reducer";

export function useFlashcardsMode(id: string) {
  const [{ flashcards: initialFlashcards }] =
    api.studySet.byId.useSuspenseQuery({ id });

  const [{ sorting, flashcards, index, starredOnly, hard, know }, dispatch] =
    useFlashcardsModeReducer(initialFlashcards);

  const [cardRef, animateCard] = useAnimate();
  const [messageRef, animateMessage] = useAnimate();
  const [flipped, setFlipped] = useState(false);

  const starredCards = initialFlashcards.filter((card) => card.starred);

  useEffect(() => {
    if (starredOnly) {
      const oldIds = flashcards.map((card) => card.id);
      const editedCards = initialFlashcards.filter((card) =>
        oldIds.includes(card.id),
      );
      dispatch({
        type: "SET_FLASHCARDS",
        payload: editedCards,
      });
    } else {
      dispatch({
        type: "SET_FLASHCARDS",
        payload: initialFlashcards,
      });
    }

    if (starredOnly && starredCards.length === 0) {
      dispatch({ type: "TOGGLE_STARRED_ONLY" });
    }
  }, [initialFlashcards]);

  const currentCard = flashcards[index];

  const disableStarredOnly = starredCards.length === 0;

  const count = flashcards.length;

  const progress = (index / flashcards.length) * 100;

  const reviewHard = () => {
    setFlipped(false);
    dispatch({ type: "REVIEW_HARD" });
  };

  const reset = () => {
    setFlipped(false);
    dispatch({ type: "RESET", payload: initialFlashcards });
  };

  const resetFlip = useCallback(() => {
    setFlipped(false);
  }, []);

  const toggleFlip = useCallback(() => {
    setFlipped((prev) => !prev);
  }, []);

  const handleLeft = useCallback(async () => {
    if (!currentCard) {
      return;
    }

    if (!sorting && index === 0) {
      return;
    }

    setFlipped(false);

    if (sorting) {
      dispatch({ type: "MARK_HARD", payload: currentCard });

      await animateMessage(
        messageRef.current,
        {
          opacity: [0, 1, 1, 0],
          visibility: "visible",
          rotate: [0, 2, 2, 0],
          translateX: [0, 0, 0, -50],
        },
        {
          ease: "linear",
          duration: 0.5,
        },
      );
      await animateMessage(
        messageRef.current,
        { visibility: "hidden" },
        { duration: 0 },
      );

      dispatch({ type: "NEXT" });
    } else {
      dispatch({ type: "PREVIOUS" });
      animateCard(
        cardRef.current,
        { rotateY: [15, 0], translateX: [-60, 0] },
        { duration: 0.15 },
      );
    }
  }, [animateCard, animateMessage, currentCard, index, messageRef, sorting]);

  const handleRight = useCallback(async () => {
    if (!currentCard) {
      return;
    }

    setFlipped(false);

    if (sorting) {
      dispatch({ type: "MARK_KNOWN" });

      await animateMessage(
        messageRef.current,
        {
          opacity: [0, 1, 1, 0],
          visibility: "visible",
          rotate: [0, -2, -2, 0],
          translateX: [0, 0, 0, 50],
        },
        { ease: "linear", duration: 0.5 },
      );
      await animateMessage(
        messageRef.current,
        { visibility: "hidden" },
        { duration: 0 },
      );
    } else {
      animateCard(
        cardRef.current,
        { translateX: [60, 0], rotateY: [-15, 0] },
        { duration: 0.15 },
      );
    }

    dispatch({ type: "NEXT" });
  }, [animateCard, animateMessage, currentCard, messageRef, sorting]);

  const shuffle = () => {
    setFlipped(false);
    dispatch({ type: "SHUFFLE" });
  };

  const toggleSorting = () => {
    dispatch({ type: "TOGGLE_SORTING" });
  };

  const toggleStarredOnly = () => {
    dispatch({ type: "TOGGLE_STARRED_ONLY" });
  };

  return {
    index,
    currentCard,
    flipped,
    sorting,
    starredOnly,
    disableStarredOnly,
    count,
    hardCount: hard.length,
    cardRef,
    messageRef,
    know,
    progress,
    handleLeft,
    handleRight,
    resetFlip,
    toggleFlip,
    reset,
    reviewHard,
    shuffle,
    toggleSorting,
    toggleStarredOnly,
  };
}
