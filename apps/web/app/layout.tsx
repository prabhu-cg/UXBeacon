import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UXBeacon — Measure. Monitor. Improve.",
  description:
    "UXBeacon analyzes websites and digital products to measure UX quality, accessibility, content quality, and design consistency. Free UX audit tool.",
  keywords: ["UX audit", "accessibility checker", "UX quality", "web analysis", "heuristics"],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "UXBeacon — Measure. Monitor. Improve.",
    description:
      "Free UX analysis tool. Analyze any website for UX quality, accessibility, and content issues in seconds.",
    type: "website",
    siteName: "UXBeacon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white">
        <TooltipProvider delay={300}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
