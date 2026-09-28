import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Register Page - Task Management System",
  description: "Momodu Wealth chat application Register Page",
};

export default function RegisterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Nested layout — root layout provides <html>/<body>.
  return <>{children}</>;
}
