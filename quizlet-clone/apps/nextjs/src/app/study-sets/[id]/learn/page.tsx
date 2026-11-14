import type { Metadata } from "next";

import { auth } from "@acme/auth";

import LearnMode from "~/components/learn-mode/learn-mode";
import { api, HydrateClient } from "~/trpc/server";

interface LearnModeProps {
  params: { id: string };
  searchParams?: { wordsPerRound?: string };
}

export async function generateMetadata({
  params: { id },
}: LearnModeProps): Promise<Metadata> {
  const { title } = await api.studySet.byId({ id });

  return {
    title: `${title} - Learn`,
  };
}

export default async function Learn({
  params: { id },
  searchParams,
}: LearnModeProps) {
  await api.studySet.learnCards.prefetch({ id });
  const session = await auth();
  const wordsPerRound = Number(searchParams?.wordsPerRound);

  return (
    <HydrateClient>
      <div className="flex min-h-[calc(100vh-145px)] items-center justify-center">
        <div className="w-full max-w-7xl">
          <LearnMode
            session={session}
            wordsPerRound={
              Number.isFinite(wordsPerRound) && wordsPerRound > 0
                ? wordsPerRound
                : undefined
            }
          />
        </div>
      </div>
    </HydrateClient>
  );
}
