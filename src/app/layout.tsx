import { DynamicFavicon } from "@/components/DynamicFavicon";
import { Modal } from "@/components/Modal";
import { AppProvider } from "@/providers";
import { ToastContainer } from "react-toastify";

import clsx from "clsx";
import type { Metadata } from "next";
import localFont from "next/font/local";

import "@fontsource/inter-tight";
import "@fontsource/space-grotesk";
import "@styles/globals.css";

const fkDisplay = localFont({
  src: "../fonts/FKDisplay-RegularAlt.woff",
  variable: "--font-fk-display",
  weight: "400",
});

const fkGrotesk = localFont({
  src: [
    { path: "../fonts/FKGrotesk-Bold.woff", weight: "700" },
    { path: "../fonts/FKGrotesk-BoldItalic.woff", weight: "700" },
    { path: "../fonts/FKGrotesk-Italic.woff", weight: "400" },
    { path: "../fonts/FKGrotesk-Regular.woff", weight: "400" },
    { path: "../fonts/FKGroteskMono-Regular.woff", weight: "400" },
  ],
  variable: "--font-fk-grotesk",
});

export const metadata: Metadata = {
  title: "Rise Testnet",
  description:
    "Rise Testnet Explorer - Explore tokens, applications, and more on the Rise Testnet",
  icons: {
    icon: [
      { url: "/favicon_light.svg", media: "(prefers-color-scheme: light)" },
      { url: "/favicon_dark.svg", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={clsx(fkDisplay.variable, fkGrotesk.variable, "font-sans")}
      >
        <AppProvider>
          <DynamicFavicon />
          <Modal />
          <ToastContainer theme="colored" icon={false} />
          <main className="mx-auto max-w-10xl w-full h-auto pr-3 relative min-h-vh">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
