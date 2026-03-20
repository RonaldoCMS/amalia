import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ChallengeConfigurationProvider } from "./context/ChallengeConfigurationContext";
import { AuthProvider } from "./context/AuthContext";
import { AppShell } from "./components/AppShell";
import { LanguageProvider } from "../i18n/LanguageProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "amalia — La tua maestra di codice",
  description: "Allena le tue skill con sfide di programmazione generate dall'AI.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
            </ChallengeConfigurationProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
