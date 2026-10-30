import type { Metadata } from "next";
import localFont from "next/font/local";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/700.css";
import "./globals.css";
import { GlassCursor } from "@/components/GlassCursor";
import { Nav } from "@/components/Nav";
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
        {/* Without JavaScript nothing can reveal itself, so show it. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}[data-typing] .typed-letter{opacity:1!important}`}</style>
        </noscript>
      </head>
      <body>
        <Nav />
        {children}
        <GlassCursor />
      </body>
    </html>
  );
}
