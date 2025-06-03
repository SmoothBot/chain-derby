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
  title: "Chain Derby | Blockchain Transaction Speed Racing",
  description: "Race your transactions across multiple EVM blockchains and discover which chain is the fastest. Compare transaction speeds, latency, and performance in real-time blockchain racing.",
  keywords: ["blockchain", "transaction speed", "EVM", "crypto", "racing", "blockchain comparison", "transaction latency", "Web3", "DeFi"],
  authors: [{ name: "Chain Derby Team" }],
  creator: "Chain Derby",
  publisher: "Chain Derby",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/favicon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chainderby.com",
    title: "Chain Derby | Blockchain Transaction Speed Racing",
    description: "Race your transactions across multiple EVM blockchains and discover which chain is the fastest. Compare transaction speeds, latency, and performance in real-time.",
    siteName: "Chain Derby",
    images: [
      {
        url: "/horse.png",
        width: 800,
        height: 600,
        alt: "Chain Derby - Blockchain Racing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chain Derby | Blockchain Transaction Speed Racing",
    description: "Race your transactions across multiple EVM blockchains and discover which chain is the fastest.",
    images: ["/horse.png"],
    creator: "@chainderby",
    site: "@chainderby",
  },
  metadataBase: new URL("https://chainderby.com"),
  alternates: {
    canonical: "/",
  },
  category: "Technology",
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
          <Modal />
          <ToastContainer theme="colored" icon={false} />
          <main className="mx-auto w-full h-auto relative min-h-screen">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
