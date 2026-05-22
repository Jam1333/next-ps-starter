import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk"
});

export const metadata: Metadata = {
  title: "Neo Canvas",
  description: "A Photoshop-inspired browser editor built with Next.js, Prisma, SQLite, and Auth.js."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${grotesk.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
