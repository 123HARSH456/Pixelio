import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


// --- SEO CONFIGURATION ---
export const metadata: Metadata = {
  title: {
    default: "Pixelio | AI Pixel Art Generator",
    template: "%s | Pixelio" 
  },
  description: "Generate stunning 32x32 pixel art sprites instantly using AI. Free, fast, and perfect for game developers and retro artists.",
  
  keywords: ["pixel art", "AI generator", "sprite maker", "game assets", "8-bit art", "retro graphics", "generative AI", "pixelio"],
  
  authors: [{ name: "Harsh Ratnaparkhe" }], 
  creator: "Harsh Ratnaparkhe", 
  
  openGraph: {
    title: "Pixelio - AI Pixel Art Studio",
    description: "Turn text into retro pixel art in seconds. The ultimate AI sprite engine for creatives.",
    url: "https://pixelioai.vercel.app", 
    siteName: "Pixelio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png", 
        width: 1200,
        height: 630,
        alt: "Pixelio Interface Preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Pixelio - AI Pixel Art Studio",
    description: "Turn text into retro pixel art in seconds. Try it now!",
  },

  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",
  
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950`}
      >
        {children}
      </body>
    </html>
  );
}