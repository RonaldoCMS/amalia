import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ChallengeConfigurationProvider } from "./context/ChallengeConfigurationContext";
import { AuthProvider } from "./context/AuthContext";
import { AppShell } from "./components/AppShell";
import { LanguageProvider } from "../i18n/LanguageProvider";
import { CookieBanner } from "./components/CookieBanner";
import { SplashScreen } from "./components/SplashScreen";

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
    startupImage: [
      // iPhone SE (2nd/3rd gen) — 320×568 @2×
      { url: "/api/splash?w=640&h=1136",   media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" },
      // iPhone 8 / 7 / 6s / 6 — 375×667 @2×
      { url: "/api/splash?w=750&h=1334",   media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" },
      // iPhone 8+ / 7+ / 6s+ — 414×736 @3×
      { url: "/api/splash?w=1242&h=2208",  media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone X / XS / 11 Pro — 375×812 @3×
      { url: "/api/splash?w=1125&h=2436",  media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone XR / 11 — 414×896 @2×
      { url: "/api/splash?w=828&h=1792",   media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" },
      // iPhone XS Max / 11 Pro Max — 414×896 @3×
      { url: "/api/splash?w=1242&h=2688",  media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone 12 / 12 Pro / 13 / 13 Pro / 14 — 390×844 @3×
      { url: "/api/splash?w=1170&h=2532",  media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone 12 Pro Max / 13 Pro Max / 14 Plus — 428×926 @3×
      { url: "/api/splash?w=1284&h=2778",  media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone 14 Pro / 15 / 15 Pro — 393×852 @3×
      { url: "/api/splash?w=1179&h=2556",  media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone 14 Pro Max / 15 Plus / 15 Pro Max — 430×932 @3×
      { url: "/api/splash?w=1290&h=2796",  media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" },
      // iPad mini — 768×1024 @2×
      { url: "/api/splash?w=1536&h=2048",  media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" },
      // iPad Air / iPad 10th — 820×1180 @2×
      { url: "/api/splash?w=1640&h=2360",  media: "(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2)" },
      // iPad Pro 11" — 834×1194 @2×
      { url: "/api/splash?w=1668&h=2388",  media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" },
      // iPad Pro 12.9" — 1024×1366 @2×
      { url: "/api/splash?w=2048&h=2732",  media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" },
    ],
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
              <SplashScreen />
              <AppShell>{children}</AppShell>
              <CookieBanner />
            </ChallengeConfigurationProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
