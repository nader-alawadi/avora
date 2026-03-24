import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AVORA — AI-Powered GTM & Sales Intelligence Platform",
  description:
    "Find, qualify and connect with your ideal customers using AI. Get verified leads, GTM strategy, and outreach playbooks — all in one platform.",
  keywords:
    "GTM strategy, go-to-market, sales intelligence, ICP builder, lead discovery, ABM, account-based marketing, outreach playbook, B2B sales, AI sales platform, ARIA AI",
  authors: [{ name: "Enigma Sales" }],
  creator: "Enigma Sales",
  publisher: "AVORA by Enigma Sales",
  metadataBase: new URL("https://avora.ai"),
  openGraph: {
    title: "AVORA — AI-Powered GTM & Sales Intelligence Platform",
    description:
      "Find, qualify and connect with your ideal customers using AI. Get verified leads, GTM strategy, and outreach playbooks — all in one platform.",
    url: "https://avora.ai",
    siteName: "AVORA",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AVORA — AI-Powered GTM & Sales Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AVORA — AI-Powered GTM & Sales Intelligence",
    description:
      "Find, qualify and connect with your ideal customers using AI. Verified leads, GTM strategy, and outreach playbooks.",
    images: ["/og-image.png"],
    creator: "@avoraai",
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
  alternates: {
    canonical: "https://avora.ai",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AVORA by Enigma Sales",
  description:
    "AI-powered GTM & Sales Intelligence platform — find, qualify and connect with your ideal customers",
  url: "https://avora.ai",
  logo: "https://avora.ai/avora-logo.svg",
  sameAs: [
    "https://linkedin.com/company/avora-ai",
    "https://twitter.com/avoraai",
  ],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Nunito:wght@600;800&display=swap"
          rel="stylesheet"
        />
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
