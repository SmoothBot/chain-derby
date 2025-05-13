import { Card as CustomCard } from "@/components/CustomCard";
import { RiseLogo } from "@/components/RiseLogo";
import { ToastMessage } from "@/components/ToastMessage";
import { Button, Card, Separator } from "@/components/ui";
import { useModal } from "@/hooks/useModal";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "react-toastify";

export function SampleComponents() {
  const { showModal } = useModal();
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid gap-10 lg:gap-10 items-center justify-center pb-10 text-center">
      {/* BUTTON */}
      <div className="grid gap-4 justify-center">
        <p className="text-lg font-bold">Button</p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
      <Separator />
      {/* CARD */}
      <div className="grid gap-4 justify-center">
        <p className="text-lg font-bold">Card</p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Card className="w-80 h-40 flex justify-center">
            <p>Default</p>
          </Card>
          <CustomCard
            className="w-80 h-40"
            innerDiv={{ className: "flex items-center justify-center" }}
          >
            <p>Custom Card</p>
          </CustomCard>
        </div>
      </div>
      <Separator />
      {/* ALERT */}
      <div className="grid gap-4 justify-center">
        <p className="text-lg font-bold">Alert</p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Button
            variant="secondary"
            onClick={() => {
              toast(
                <ToastMessage title="Success" content="Congratulations!" />,
                { type: "success" }
              );
            }}
          >
            Success
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              toast(
                <ToastMessage title="Info" content="This is a sample Info!" />,
                { type: "info" }
              );
            }}
          >
            Info
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              toast(
                <ToastMessage
                  title="Warning"
                  content="This is a sample Warning!"
                />,
                { type: "warning" }
              );
            }}
          >
            Warning
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              toast(<ToastMessage title="Error" content="Ooops Failed!" />, {
                type: "error",
              });
            }}
          >
            Error
          </Button>
        </div>
      </div>
      <Separator />
      {/* MODAL */}
      <div className="grid gap-4 justify-center">
        <p className="text-lg font-bold">Modal</p>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              showModal({
                content: (
                  <div className="grid gap-4">
                    <p className="font-bold">Oh, Hello There!</p>
                    <p>Change to mobile screen and see Bottom-sheet!</p>
                  </div>
                ),
              });
            }}
          >
            Open Modal
          </Button>
        </div>
      </div>
      <Separator />
      {/* NAVIGATION BAR */}
      <div className="justify-center w-full space-y-4">
        <p className="text-lg font-bold">Navigation Bar</p>
        <p className="text-md">
          Two options for navigation — Sidebar and Navigation bar.{" "}
          <span className="italic">This is a work in progress</span>
        </p>
        <div className="flex justify-between rounded-sm border border-border-primary w-full p-4">
          <RiseLogo />
          <div className="flex items-center justify-start">
            <Button
              asChild
              variant="ghost"
              className="h-fit p-0 "
              onClick={() => {
                setTheme(theme === "light" ? "dark" : "light");
              }}
            >
              {theme === "light" ? (
                <MoonIcon className="h-4 w-4" />
              ) : (
                <SunIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <Separator />
      {/* DRAWER */}
      <div className="grid gap-4 justify-center">
        <p className="text-lg font-bold">Drawer</p>
        <div className="flex gap-3">
          <p>TODO: Add Drawer</p>
        </div>
      </div>
    </div>
  );
}
