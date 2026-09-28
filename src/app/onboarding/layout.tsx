import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get started - TaskFlow",
  description: "Complete your TaskFlow workspace setup",
};

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
