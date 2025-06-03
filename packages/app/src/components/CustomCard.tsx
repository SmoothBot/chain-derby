import { Card as UiCard } from "@/components/ui";
import { cn } from "@/lib/utils";

export type CardProps = React.ComponentProps<"div"> & {
  label?: string;
  children?: React.ReactNode;
  innerDiv?: React.ComponentProps<"div">;
};

export function Card(props: Readonly<CardProps>) {
  const { label, children, className, innerDiv } = props;
  return (
    <UiCard {...props} className={cn("border-none rounded-xl p-0", className)}>
      <div className="bg-card-secondary dark:bg-card-secondary/50 rounded-xl h-full p-2">
        <div
          className={cn(
            { ...innerDiv },
            "bg-background h-full rounded-lg p-3 md:p-5",
            innerDiv?.className
          )}
        >
          {label && <p className="text-xl lg:text-3xl">{label}</p>}
          {children}
        </div>
      </div>
    </UiCard>
  );
}
