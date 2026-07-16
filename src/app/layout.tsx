import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import { TiquoConfigurationBar } from "@/components/tiquo-configuration-bar";
import { TiquoProvider } from "@/components/tiquo-provider";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Tiquo Example — DOM Package Demo",
    template: "%s — Tiquo Example",
  },
  description:
    "A from-scratch Next.js example showing authentication, analytics, bookings, orders, and customer data with the Tiquo DOM Package.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#d7ff75",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <TiquoProvider>
          <TiquoConfigurationBar />
          <SiteHeader />
          {children}
        </TiquoProvider>
      </body>
    </html>
  );
}
