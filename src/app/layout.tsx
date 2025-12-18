import type { Metadata } from "next";
import { Inter, Scheherazade_New } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const scheherazade = Scheherazade_New({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Muara - Mesin Pencari Rumusan & Ibarat Fikih",
  description: "Platform pencarian canggih untuk menemukan rumusan musyawarah dan ibarat fikih dari berbagai sumber terpercaya.",
  keywords: ["fikih", "islam", "rumusan", "ibarat", "musyawarah", "muara", "NU"],
  authors: [{ name: "Khazanah Fikih Team" }],
  openGraph: {
    title: "Muara",
    description: "Platform pencarian canggih untuk menemukan rumusan musyawarah dan ibarat fikih",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Muara",
    description: "Platform pencarian canggih untuk menemukan rumusan musyawarah dan ibarat fikih",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${scheherazade.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
