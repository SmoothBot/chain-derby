"use client";

import { useIsMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import { ModalProps } from "@/providers/ModalProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui";

export type DialogProps = Omit<ModalProps, "content"> & {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

export function GenericModal(props: Readonly<DialogProps>) {
  const {
    title,
    description,
    contentProps,
    isOpen,
    onClose,
    disableClose,
    hiddenClose,
    children,
  } = props;

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet
        open={isOpen}
        onOpenChange={() => {
          if (!disableClose) {
            onClose();
          }
        }}
      >
        <SheetContent
          {...contentProps}
          data-mobile="true"
          className={cn(
            "bg-sidebar text-sidebar-foreground p-4 [&>button]:hidden",
            contentProps?.className
          )}
          side="bottom"
          disableClose={disableClose || hiddenClose}
        >
          <SheetHeader className="py-0 px-2">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        if (!disableClose) {
          onClose();
        }
      }}
    >
      <DialogContent
        {...contentProps}
        disableClose={disableClose || hiddenClose}
      >
        <DialogHeader className={cn(!title && "hidden")}>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
