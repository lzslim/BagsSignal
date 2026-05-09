import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { WalletProviders } from "@/components/wallet/WalletProviders";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "BagsSignal",
  description: "A Bags creator intelligence dashboard for token fee revenue, market signals, and claims."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <WalletProviders>{children}</WalletProviders>
      </body>
    </html>
  );
}
