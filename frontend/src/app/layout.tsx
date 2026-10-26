import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PrecisionRx AI — Personalized Medicine Intelligence",
  description:
    "AI-powered clinical decision support platform. Hyper-personalized drug treatment decisions using patient genomics, EHR data, and wearable insights.",
  keywords: ["pharmacogenomics", "precision medicine", "clinical AI", "drug recommendation"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
