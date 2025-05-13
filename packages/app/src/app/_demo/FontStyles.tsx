import { Separator } from "@/components/ui";

export function FontStyles() {
  return (
    <div className="grid gap-10 lg:gap-10 items-center justify-center pb-10 text-center">
      {/* FONT FAMILY */}
      <div className="grid gap-6 justify-center">
        <p className="text-lg font-bold">Font Family</p>
        <div>
          <p className="font-eyebrow text-xl">Eyebrow</p>
          <p className="font-eyebrow text-3xl font-bold">Space Grotesk</p>
          <p className="font-eyebrow text-lg">font-eyebrow</p>
        </div>
        <div>
          <p className="font-headline text-xl">Headline</p>
          <p className="font-headline text-3xl font-bold">FK Display</p>
          <p className="font-headline text-lg">font-headline</p>
        </div>
        <div>
          <p className="font-subtitle text-xl">Subtitle</p>
          <p className="font-subtitle text-3xl font-bold">FK Grotesk</p>
          <p className="font-subtitle text-lg">font-subtitle</p>
        </div>
        <div>
          <p className="font-body text-xl">Body</p>
          <p className="font-body text-3xl font-bold">Inter Tight</p>
          <p className="font-body text-lg">font-body</p>
        </div>
      </div>
      <Separator />
      <div className="grid gap-10">
        <p className="text-lg font-bold">Text Color</p>
        <div className="flex text-wrap gap-10 justify-center">
          <div>
            <p className="font-eyebrow text-xl text-text-primary">Default</p>
            <p className="font-eyebrow text-3xl font-bold text-text-primary">
              Space Grotesk
            </p>
            <p className="font-eyebrow text-lg">text-text-primary</p>
          </div>
          <div>
            <p className="font-subtitle text-xl text-text-secondary">
              Secondary
            </p>
            <p className="font-subtitle text-3xl font-bold text-text-secondary">
              FK Grotesk
            </p>
            <p className="font-subtitle text-lg text-text-secondary">
              text-text-secondary
            </p>
          </div>
          <div>
            <p className="font-headline text-xl text-text-accent">Accent</p>
            <p className="font-headline text-3xl font-bold text-text-accent">
              FK Display
            </p>
            <p className="font-headline text-lg text-text-accent">
              text-text-accent
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
