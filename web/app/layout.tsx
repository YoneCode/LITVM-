import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import { MotionProvider } from "@/components/providers/MotionProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

// Display face for landing (brand) headlines only — body + the entire
// dashboard stay on Inter, per the product register.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LitVM Yield · Stake wrapped Litecoin, earn VRT",
  description:
    "Wrap zkLTC, stake it in a non-custodial farm on the LitVM testnet, and earn claimable VRT — per-user rewards, no lock-up, fully on-chain.",
  keywords: [
    "LitVM",
    "Litecoin",
    "zkEVM",
    "yield farm",
    "staking",
    "zkLTC",
    "DeFi",
    "VRT",
  ],
  openGraph: {
    title: "LitVM Yield · Stake wrapped Litecoin, earn VRT",
    description:
      "Stake WzkLTC, earn claimable VRT. Non-custodial, on-chain, no lock-ups, on the LitVM testnet.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1815",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="font-sans antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
