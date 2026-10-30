import type { Metadata } from "next";
import localFont from "next/font/local";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/700.css";
import "./globals.css";
import { introGateScript } from "@/components/intro/introGate";

const blur = localFont({
  src: "../fonts/Blur-Bold.ttf",
  variable: "--font-blur",
  weight: "700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Daaf Heijnekamp",
  description: "Creative developer and designer.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The intro gate script sets data-intro on <html> before hydration.
    <html lang="en" className={`${blur.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introGateScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
