import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ChallengeConfigurationProvider } from "./context/ChallengeConfigurationContext";
import { AuthProvider } from "./context/AuthContext";
import { AppShell } from "./components/AppShell";
import { LanguageProvider } from "../i18n/LanguageProvider";
import { CookieBanner } from "./components/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#22d3ee",
};

export const metadata: Metadata = {
  title: "amalia — La tua maestra di codice",
  description: "Allena le tue skill con sfide di programmazione generate dall'AI.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "amalia",
    startupImage: "/icons/apple-splash.png",
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <LanguageProvider>
            <ChallengeConfigurationProvider>
              <AppShell>{children}</AppShell>
              <CookieBanner />
            </ChallengeConfigurationProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
