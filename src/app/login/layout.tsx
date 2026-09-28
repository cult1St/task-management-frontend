import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Login Page - Task Management System",
  description: "Momodu Wealth chat application Login Page",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Nested layout — do not render <html>/<body>. Root `app/layout.tsx` provides those.
  return <>{children}</>;
}
