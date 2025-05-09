"use client";

import { Button } from "@/components/ui";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="outline"
      size="icon"
      className="w-9 h-9 rounded-full"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle dark mode"
    >
      {theme === "light" ? (
        <MoonIcon className="h-4 w-4" />
      ) : (
        <SunIcon className="h-4 w-4" />
      )}
    </Button>
  );
}