"use client";

import { useModal } from "@/hooks/useModal";
import { GenericModal } from "./GenericModal";

export function Modal() {
  const { content, ...props } = useModal();

  return <GenericModal {...props}>{content}</GenericModal>;
}
