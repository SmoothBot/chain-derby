import { PageContext } from "@/providers/PageProvider";
import { useContext } from "react";

export function usePage() {
  const context = useContext(PageContext);

  if (!context) {
    throw new Error("usePage must be used within an ModalProvider");
  }

  return context;
}
