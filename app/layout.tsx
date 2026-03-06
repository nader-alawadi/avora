import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AVORA — AI-Powered GTM & Sales Strategy Platform",
  description:
    "Generate your complete Go-To-Market strategy in minutes with AI. ICP, DMU Map, ABM Strategy, Outreach Playbook, and targeted leads — all powered by Claude AI.",
  keywords: "GTM strategy, go-to-market, ICP, ideal customer profile, ABM, account-based marketing, outreach, B2B sales, AI strategy",
  authors: [{ name: "Enigma Sales" }],
  creator: "Enigma Sales",
  publisher: "AVORA by Enigma Sales",
  openGraph: {
    title: "AVORA — AI-Powered GTM & Sales Strategy Platform",
    description: "Generate your complete Go-To-Market strategy in minutes with AI. ICP, DMU Map, ABM Strategy, Outreach Playbook, and targeted leads.",
    url: "https://avora.ai",
    siteName: "AVORA",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AVORA — AI-Powered GTM Strategy",
    description: "Generate your complete Go-To-Market strategy in minutes with AI.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AVORA by Enigma Sales",
  description: "AI-powered Go-To-Market strategy platform for B2B sales teams",
  url: "https://avora.ai",
  logo: "https://avora.ai/avora-logo.svg",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    availableLanguage: ["English", "Arabic"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="antialiased">
        <main>{children}</main>
      </body>
    </html>
  );
}
