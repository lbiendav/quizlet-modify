"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  GraduationCap,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";

import { Button } from "@acme/ui/button";
import { Card, CardContent } from "@acme/ui/card";
import { Progress } from "@acme/ui/progress";

import type { SavedLearnProgress } from "~/lib/learn-progress";
import {
  clearLearnProgress,
  getSavedLearnProgress,
} from "~/lib/learn-progress";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const INITIAL_DAILY_WORD_GOAL = 60;
const GOAL_DAYS = 30;

const StudyModes = ({
  studySetId,
  termCount,
}: {
  studySetId: string;
  termCount: number;
}) => {
  const maxWordsPerRound = Math.max(termCount, 1);

  const [wordsPerRoundInput, setWordsPerRoundInput] = useState(() =>
    String(clamp(15, 1, maxWordsPerRound)),
  );
  const [dailyWordGoalInput, setDailyWordGoalInput] = useState(
    String(INITIAL_DAILY_WORD_GOAL),
  );
  const [savedProgress, setSavedProgress] =
    useState<SavedLearnProgress | null>(null);

  useEffect(() => {
    const progress = getSavedLearnProgress(studySetId);
    if (progress) {
      setSavedProgress(progress);
      if (progress.sessionSize) {
        setWordsPerRoundInput(
          String(clamp(progress.sessionSize, 1, maxWordsPerRound)),
        );
      }
    }
  }, [studySetId, maxWordsPerRound]);

  // Derived numeric values
  const parsedWords = parseInt(wordsPerRoundInput, 10);
  const wordsPerRound =
    Number.isFinite(parsedWords) && parsedWords > 0
      ? clamp(parsedWords, 1, maxWordsPerRound)
      : 15;

  const parsedGoal = parseInt(dailyWordGoalInput, 10);
  const dailyWordGoal =
    Number.isFinite(parsedGoal) && parsedGoal > 0
      ? parsedGoal
      : INITIAL_DAILY_WORD_GOAL;

  const learnHref = `${studySetId}/learn?wordsPerRound=${wordsPerRound}`;
  const sessionsPerDay = Math.ceil(dailyWordGoal / wordsPerRound);
  const totalWordGoal = dailyWordGoal * GOAL_DAYS;

  const hasInProgress =
    savedProgress &&
    savedProgress.completedCount > 0 &&
    savedProgress.completedCount < termCount;

  const progressPercent = hasInProgress
    ? Math.round((savedProgress.completedCount / termCount) * 100)
    : 0;

  const handleResetProgress = () => {
    const confirmed = window.confirm(
      "Bắt đầu lại từ đầu? Tiến độ học dở của bộ thẻ này sẽ được xoá.",
    );
    if (!confirmed) return;

    clearLearnProgress(studySetId);
    setSavedProgress(null);
  };

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2">
      <Card
        aria-label="Learn settings"
        className="group h-full hover:shadow-md"
      >
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <GraduationCap
                size={20}
                className="transition-colors duration-300 group-hover:text-primary"
              />
              <span className="font-semibold">Learn</span>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link
                href="/tracking_schedule/diem-danh.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                <CalendarCheck2 className="mr-2 size-4" />
                Điểm Danh
              </Link>
            </Button>
          </div>

          {hasInProgress && (
            <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium text-primary">
                  <Sparkles className="size-4" />
                  Đang học dở
                </span>
                <span className="font-semibold text-muted-foreground">
                  {savedProgress.completedCount} / {termCount} từ (
                  {progressPercent}%)
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                <span>
                  Vòng{" "}
                  {Math.floor(
                    savedProgress.startIndex / savedProgress.sessionSize,
                  ) + 1}
                  : thẻ {savedProgress.cardIndex + 1} /{" "}
                  {savedProgress.sessionSize}
                </span>
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="flex items-center gap-1 underline hover:text-foreground"
                >
                  <RotateCcw className="size-3" />
                  Học lại từ đầu
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Words/Round
              </label>
              <input
                type="number"
                min={1}
                max={maxWordsPerRound}
                value={wordsPerRoundInput}
                onFocus={(event) => event.target.select()}
                onChange={(event) => setWordsPerRoundInput(event.target.value)}
                onBlur={() => {
                  const num = parseInt(wordsPerRoundInput, 10);
                  if (!Number.isFinite(num) || num < 1) {
                    setWordsPerRoundInput("1");
                  } else if (num > maxWordsPerRound) {
                    setWordsPerRoundInput(String(maxWordsPerRound));
                  } else {
                    setWordsPerRoundInput(String(num));
                  }
                }}
                className="h-10 w-36 rounded-md border border-input bg-background px-3 py-2 text-sm"
                aria-label="Words per round"
              />
            </div>
            <Button asChild className="gap-2">
              <Link href={learnHref}>
                {hasInProgress ? (
                  <>
                    Tiếp tục học
                    <ArrowRight className="size-4" />
                  </>
                ) : (
                  "Bắt đầu học"
                )}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card
        aria-label="30-day study goal"
        className="group h-full hover:shadow-md"
      >
        <CardContent className="flex h-full flex-col p-4">
          <div className="flex items-center gap-2">
            <Target
              size={20}
              className="transition-colors duration-300 group-hover:text-primary"
            />
            <span>Mục tiêu 30 ngày</span>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg border bg-muted/30 p-3 text-center">
            <div>
              <input
                type="number"
                min={1}
                value={dailyWordGoalInput}
                onFocus={(event) => event.target.select()}
                onChange={(event) => setDailyWordGoalInput(event.target.value)}
                onBlur={() => {
                  const num = parseInt(dailyWordGoalInput, 10);
                  if (!Number.isFinite(num) || num < 1) {
                    setDailyWordGoalInput("1");
                  } else {
                    setDailyWordGoalInput(String(num));
                  }
                }}
                aria-label="Daily word goal"
                className="w-24 appearance-none rounded-md border border-transparent bg-transparent text-center text-2xl font-semibold tabular-nums outline-none transition-colors hover:border-input focus:border-primary [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <div className="text-xs text-muted-foreground">từ / ngày</div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground" />
            <div>
              <div className="text-2xl font-semibold tabular-nums">
                {totalWordGoal.toLocaleString("vi-VN")}
              </div>
              <div className="text-xs text-muted-foreground">từ / 30 ngày</div>
            </div>
          </div>

          <div
            aria-live="polite"
            className="mt-3 rounded-lg bg-primary/10 px-3 py-3 text-center"
          >
            <div className="text-sm font-semibold tabular-nums">
              {wordsPerRound} w/r ⇒ {sessionsPerDay} lần học
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyModes;
