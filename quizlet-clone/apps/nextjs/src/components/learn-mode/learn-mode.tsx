"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight, RotateCcw, Undo2 } from "lucide-react";

import type { Session } from "@acme/auth";
import { Button } from "@acme/ui/button";
import { Progress } from "@acme/ui/progress";
import { Separator } from "@acme/ui/separator";

import { useLearnMode } from "~/hooks/use-learn-mode";
import FlashcardCard from "../shared/flashcard-card";
import GameResult from "../shared/game-result";
import MultipleChoiceCard from "../shared/multiple-choice-card";

const LearnMode = ({
  session,
  wordsPerRound,
}: {
  session: Session | null;
  wordsPerRound?: number;
}) => {
  const { id }: { id: string } = useParams();

  const router = useRouter();

  const {
    chooseAnswer,
    currentCard,
    reset,
    index,
    progress,
    isCompleted,
    flashcards,
    totalCount,
    completedCount,
    roundCompletedCount,
    roundProgress,
    isReviewing,
    reviewRemainingCount,
    pendingWrongAnswer,
    continueNextRound,
  } = useLearnMode(id, wordsPerRound);

  const backToStudySet = () => {
    router.push(`/study-sets/${id}`);
  };

  const hasNextRound = completedCount < totalCount;
  const confirmResetFromBeginning = () => {
    const confirmed = window.confirm(
      "Start from beginning? This will reset your saved progress to the first word.",
    );

    if (!confirmed) return;

    void reset();
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={backToStudySet}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Undo2 size={16} />
          Quay lại bộ thẻ
        </Button>
        <span className="text-xs text-muted-foreground">
          ✓ Đã tự động lưu tiến độ
        </span>
      </div>

      <div className="mb-6 space-y-5">
        {isReviewing && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-lg">
            Review wrong words: {reviewRemainingCount} remaining. Answer all of
            them correctly to unlock Next round.
          </div>
        )}
        <div>
          <div className="mb-2 flex justify-between text-xl text-muted-foreground">
            <span>Total progress</span>
            <span>
              {completedCount} / {totalCount}
            </span>
          </div>
          <Progress value={progress} />
        </div>
        <div>
          <div className="mb-2 flex justify-between text-xl text-muted-foreground">
            <span>Round progress</span>
            <span>
              {roundCompletedCount} / {flashcards.length}
            </span>
          </div>
          <Progress value={roundProgress} />
        </div>
      </div>
      {!isCompleted && currentCard && (
        <MultipleChoiceCard
          term={currentCard.term}
          answers={currentCard.answers}
          index={index}
          callback={chooseAnswer}
          definition={currentCard.definition}
          userAnswer={pendingWrongAnswer}
        />
      )}
      {isCompleted && (
        <>
          <div className="mb-8 text-2xl font-bold">U finished learning</div>
          <GameResult
            hard={flashcards.length - roundCompletedCount}
            cardCount={flashcards.length}
            hideLearning
            firstButton={{
              text: hasNextRound ? "Next round" : "Start from beginning",
              description: hasNextRound
                ? "Continue with the next round."
                : "Restart this study set from the first word.",
              Icon: hasNextRound ? (
                <ArrowRight size={20} />
              ) : (
                <RotateCcw size={20} />
              ),
              callback: hasNextRound
                ? continueNextRound
                : confirmResetFromBeginning,
            }}
            secondButton={{
              text: "Back to study set",
              description: "Back to study set",
              Icon: <Undo2 size={20} />,
              callback: backToStudySet,
            }}
          />
          {hasNextRound && (
            <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={confirmResetFromBeginning}
              >
                Start from beginning
              </Button>
            </div>
          )}
          <Separator className="my-4 md:my-8" />
          <div>
            <span className="mb-4 inline-block text-xl font-bold">
              Terms studied in this round
            </span>
            <div className="flex flex-col gap-4">
              {flashcards.map((flashcard, index) => (
                <FlashcardCard
                  key={index}
                  flashcard={flashcard}
                  session={session}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default LearnMode;
