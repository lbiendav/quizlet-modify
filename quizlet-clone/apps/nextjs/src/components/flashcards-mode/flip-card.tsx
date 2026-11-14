"use client";

import { motion } from "framer-motion";

import type { Session } from "@acme/auth";
import { cn } from "@acme/ui";

import { useFlashcardsModeContext } from "~/contexts/flashcards-mode-context";
import FlipCardContent from "./flip-card-content";

interface FlipCardProps {
  fullscreen?: boolean;
  session: Session | null;
}

const FlipCard = ({ fullscreen, session }: FlipCardProps) => {
  const { currentCard, cardRef, flipped, toggleFlip } =
    useFlashcardsModeContext();

  if (!currentCard) {
    return null;
  }

  return (
    <div
      role="button"
      onClick={toggleFlip}
      ref={cardRef}
      className={cn("w-full [perspective:1000px]", {
        "min-h-[21rem] sm:min-h-[25rem]": !fullscreen,
        "min-h-[40rem]": fullscreen,
      })}
    >
      <motion.div
        animate={{ rotateX: flipped ? 180 : 0 }}
        transition={{ duration: 0.35 }}
        className="relative h-full w-full cursor-pointer [transform-style:preserve-3d]"
      >
        <FlipCardContent flashcard={currentCard} session={session} />
        <FlipCardContent flashcard={currentCard} session={session} back />
      </motion.div>
    </div>
  );
};

export default FlipCard;
