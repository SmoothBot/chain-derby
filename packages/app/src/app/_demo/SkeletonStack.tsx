import { Card } from "@/components/ui";
import { v4 as uuidv4 } from "uuid";

export function SkeletonStack() {
  const supports = [
    "NextJS",
    "Wagmi + Tanstack",
    "Tailwind CSS v4",
    "ShadCN / Radix UI for components",
    "React Context for State Management",
  ];

  return (
    <div className="flex flex-wrap gap-4 lg:gap-10 items-center justify-center place-self-center max-w-6xl py-10">
      <div className="flex flex-col gap-3 flex-1 min-w-64">
        {supports.map((item) => {
          return (
            <Card key={uuidv4()} className="p-5">
              <p>{item}</p>
            </Card>
          );
        })}
      </div>
      <div className="flex-1 space-y-5 min-w-64">
        <p className="text-lg lg:text-3xl font-bold font-eyebrow">
          Is the Skeleton App, a design system?
        </p>
        <p className="text-md lg:text-lg">
          No, while the skeleton app contains common components, such as{" "}
          <span className="font-bold">Button, Card, Alert</span> and other
          components, and <span className="font-bold">CSS Tokens</span>, the
          goal of this repo is to have a consistent{" "}
          <span className="font-bold"> Project Structure</span>,{" "}
          <span className="font-bold"> Design</span> and{" "}
          <span className="font-bold"> Base Tech Stack</span> across all
          frontend apps.{" "}
        </p>
      </div>
    </div>
  );
}
