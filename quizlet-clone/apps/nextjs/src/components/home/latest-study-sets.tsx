"use client";

import { Suspense } from "react";

import Empty from "@acme/ui/empty";

import { api } from "~/trpc/react";
import StudySetCard from "../shared/study-set-card";
import StudySetSkeletonGrid from "../shared/study-set-skeleton-grid";

const LatestStudySetsGrid = () => {
  const [studySets] = api.studySet.latest.useSuspenseQuery();

  if (studySets.length === 0) {
    return <Empty message="No study sets yet." />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {studySets.map((set) => (
        <StudySetCard key={set.id} studySet={set} />
      ))}
    </div>
  );
};

const LatestStudySets = () => {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Study sets</h1>
      <Suspense fallback={<StudySetSkeletonGrid />}>
        <LatestStudySetsGrid />
      </Suspense>
    </div>
  );
};

export default LatestStudySets;
