import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GTMentor — Visual Identity System",
  description: "Complete brand guide for the GTMentor Platform by Enigmasales.io",
};

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
