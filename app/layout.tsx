import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "AVORA — GTM & Sales Strategy by Enigma Sales",
  description:
    "AI-powered Go-To-Market strategy platform. Generate your ICP, DMU Map, ABM Strategy, and Outreach Playbook in minutes.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AVORA",
  },
};

export const viewport: Viewport = {
  themeColor: "#1F2A2A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-white text-[#1F2A2A]"
        style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}
      >
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
