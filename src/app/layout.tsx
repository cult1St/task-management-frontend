import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";

import "boxicons/css/boxicons.min.css";
import NavigationProgress from "@/components/NavigationProgress";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Task Management App",
  description: "Momodu Wealth Task Management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      </head>
      <body>
        <Providers>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html >
  );
}
