import { Card } from "@/components/ui";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

export function WhatIsSkeleton() {
  const supports = [
    "Basic foldering structure",
    "Common pre-designed components",
    "CSS Tokens to, hopefully, be used across all RISE Frontend apps",
    "Support for Themes ( dark | light )",
    "Support for wagmi and tanstack query",
    "Support for responsive Modal - dialog for desktop and bottom-sheet for mobile",
  ];

  return (
    <div className="flex flex-wrap gap-4 lg:gap-10 items-center justify-center place-self-center max-w-6xl">
      <div className="flex-1 space-y-5 min-w-64">
        <p className="text-lg lg:text-3xl font-bold font-eyebrow">
          What is the Skeleton App?
        </p>
        <Card className="p-4 grid gap-4">
          <div>
            <p className="italic">
              To clone the skeleton along with the demo page:
            </p>
            <p className="font-bold">npx create-rise-app demo</p>
          </div>

          <div>
            <p className="italic">Clone a clean repo:</p>
            <p className="font-bold">npx create-rise-app</p>
          </div>
        </Card>
        <p className="text-md lg:text-lg">
          The{" "}
          <Link
            href="https://github.com/risechain/rise-skeleton-frontend"
            target="_blank"
            className="font-bold underline hover:text-text-accent"
          >
            risechain/rise-skeleton-frontend
          </Link>{" "}
          repo is a minimal, pre-structured codebase that provides:
        </p>
      </div>
      <div className="flex flex-col gap-3 flex-1 min-w-64">
        {supports.map((item) => {
          return (
            <Card key={uuidv4()} className="p-5">
              <p>{item}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
