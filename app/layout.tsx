import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AVORA — GTM & Sales Strategy by Enigma Sales",
  description:
    "AI-powered Go-To-Market strategy platform. Generate your ICP, DMU Map, ABM Strategy, and Outreach Playbook in minutes.",
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
      </body>
    </html>
  );
}
