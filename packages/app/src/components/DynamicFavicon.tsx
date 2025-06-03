"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function DynamicFavicon() {
  const { systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only run on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Handle dynamic favicon changes based on theme
    const faviconLinks = document.querySelectorAll("link[rel='icon']");

    // If no favicon links exist, create one
    if (faviconLinks.length === 0) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      document.head.appendChild(link);

      if (systemTheme === "dark") {
        link.href = "/favicon_dark.svg";
      } else {
        link.href = "/favicon_light.svg";
      }
      return;
    }

    // Update existing favicon links
    faviconLinks.forEach((linkElement) => {
      const link = linkElement as HTMLLinkElement;
      if (systemTheme === "dark") {
        link.href = "/favicon_dark.svg";
      } else {
        link.href = "/favicon_light.svg";
      }
    });
  }, [systemTheme, mounted]);

  return null;
}
