import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://truefeelings.in"),

  title: {
    default: "True Feelings – Love Advice, Breakup Healing & Relationship Tips",
    template: "%s | True Feelings"
  },

  description:
    "Get real love advice, breakup healing guides, dating tips, emotional support, and self-love motivation. True Feelings helps you build healthy relationships and heal with clarity.",

  keywords: [
    "relationship advice",
    "love tips",
    "breakup healing",
    "self love",
    "dating tips",
    "communication in relationships",
    "how to move on",
  ],

  // Canonical URL
  alternates: {
    canonical: "https://truefeelings.in",
  },

  // Social Sharing OG Tags
  openGraph: {
    title: "True Feelings – Love Advice & Breakup Healing",
    description:
      "Find emotional healing, relationship guidance, and love tips that truly help.",
    url: "https://truefeelings.in",
    siteName: "True Feelings",
    type: "website",
    images: [
      {
        url: "https://truefeelings.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "True Feelings – Love & Relationship Guidance",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "True Feelings – Love & Relationship Support",
    description:
      "Honest love advice, breakup recovery, and emotional healing articles.",
    images: ["https://truefeelings.in/og-image.jpg"],
    creator: "@truefeelings",
  },

  // Icons
  icons: {
    icon: "/icons/favicon.ico",
    shortcut: "/icons/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },

  // Manifest (PWA optional)
  manifest: "/manifest.json",

  // Verification (optional—fill actual values)
  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_CODE",
    bing: "YOUR_BING_VERIFICATION_CODE",
  },

  // Other SEO
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
