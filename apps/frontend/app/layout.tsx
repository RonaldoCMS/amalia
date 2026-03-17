import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChallengeConfigurationProvider } from "./context/ChallengeConfigurationContext";
import { AuthProvider } from "./context/AuthContext";
import { AppShell } from "./components/AppShell";

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
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ChallengeConfigurationProvider>
            <AppShell>{children}</AppShell>
          </ChallengeConfigurationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
