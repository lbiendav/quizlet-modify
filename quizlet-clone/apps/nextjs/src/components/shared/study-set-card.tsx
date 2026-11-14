"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { RouterOutputs } from "@acme/api";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent } from "@acme/ui/card";
import { Progress } from "@acme/ui/progress";

import type { SavedLearnProgress } from "~/lib/learn-progress";
import { getSavedLearnProgress } from "~/lib/learn-progress";

const StudySetCard = ({
  studySet,
}: {
  studySet: RouterOutputs["studySet"]["other"][number];
}) => {
  const { id, title, flashcardCount, user } = studySet;
  const [progress, setProgress] = useState<SavedLearnProgress | null>(null);

  useEffect(() => {
    setProgress(getSavedLearnProgress(id));
  }, [id]);

  const hasProgress =
    progress &&
    progress.completedCount > 0 &&
    progress.completedCount < flashcardCount;

  const progressPercent = hasProgress
    ? Math.round((progress.completedCount / flashcardCount) * 100)
    : 0;

  return (
    <Card className="relative cursor-pointer hover:shadow-md">
      <Link
        href={`/study-sets/${id}`}
        className="absolute left-0 top-0 h-full w-full"
      />
      <CardContent className="p-5">
        <span className="mb-2 block font-medium">{title}</span>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="block w-fit">Terms {flashcardCount}</Badge>
          {hasProgress && (
            <Badge
              variant="secondary"
              className="border-primary/20 bg-primary/10 text-xs text-primary"
            >
              Đang học {progress.completedCount}/{flashcardCount}
            </Badge>
          )}
        </div>

        {hasProgress && (
          <div className="mt-3 space-y-1">
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Link
            href={`/users/${user.id}`}
            className="relative z-10 inline-flex items-center"
          >
            <Avatar className="mr-2 h-6 w-6">
              <AvatarImage src={user.image ?? undefined} alt="author avatar" />
              <AvatarFallback className="text-sm">U</AvatarFallback>
            </Avatar>
            <Button variant="link" className="p-0 text-sm text-foreground">
              {user.name}
            </Button>
          </Link>

          {hasProgress && (
            <Link
              href={`/study-sets/${id}/learn?wordsPerRound=${progress.sessionSize}`}
              className="relative z-10 text-xs font-semibold text-primary hover:underline"
            >
              Học tiếp →
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudySetCard;
