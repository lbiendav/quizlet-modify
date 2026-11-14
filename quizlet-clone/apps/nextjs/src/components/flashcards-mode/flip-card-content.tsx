"use client";

import type { MouseEvent } from "react";
import { Star, Volume2 } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import type { Session } from "@acme/auth";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";

import { useSignInDialogContext } from "~/contexts/sign-in-dialog-context";
import useStar from "~/hooks/use-star";
import EditFlashcardDialog from "../shared/edit-flashcard-dialog";

interface FlipCardContentProps {
  flashcard: RouterOutputs["studySet"]["byId"]["flashcards"][0];
  session: Session | null;
  editable?: boolean;
  back?: boolean;
}

const FlipCardContent = ({
  flashcard,
  session,
  back,
  editable,
}: FlipCardContentProps) => {
  const { toggleStar } = useStar(flashcard);
  const { onOpenChange } = useSignInDialogContext();

  const onStarClick = (event: MouseEvent) => {
    event.stopPropagation();

    if (session) {
      toggleStar();
    } else {
      onOpenChange(true);
    }
  };

  const title = back ? "Definition" : "Term";

  const content = back ? flashcard.definition : flashcard.term;

  // A card can have Japanese on either side. Always use that text so the
  // pronunciation control behaves consistently after the card is flipped.
  const japaneseText = [flashcard.term, flashcard.definition].find((text) =>
    /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/.test(text),
  );

  const pronounceJapanese = (event: MouseEvent) => {
    event.stopPropagation();

    if (!japaneseText || typeof window === "undefined") return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(japaneseText);
    utterance.lang = "ja-JP";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className={cn("absolute h-full w-full [backface-visibility:hidden]", {
        "[transform:rotateX(180deg)]": back,
      })}
    >
      <div className="flex h-full w-full flex-col rounded-lg bg-primary-foreground p-4 drop-shadow-lg md:p-6">
        <div className="flex items-center justify-between">
          <span className="select-none font-semibold">{title}</span>
          <div className="flex justify-end gap-2">
            {editable && <EditFlashcardDialog flashcard={flashcard} />}
            <Button
              aria-label="Phát âm tiếng Nhật"
              className="rounded-full"
              disabled={!japaneseText}
              onClick={pronounceJapanese}
              size="icon"
              title="Phát âm tiếng Nhật"
              variant="ghost"
            >
              <Volume2 size={16} />
            </Button>
            <Button
              className="rounded-full"
              onClick={onStarClick}
              variant="ghost"
              size="icon"
            >
              <Star
                size={16}
                className={flashcard.starred ? "text-yellow-300" : undefined}
              />
            </Button>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <span className="select-none whitespace-pre-line text-center text-3xl leading-relaxed">
            {content}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FlipCardContent;
