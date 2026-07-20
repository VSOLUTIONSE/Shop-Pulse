import type { Metadata } from "next";
import "@/index.css";
import { Providers } from "./providers";
import { ConvexClientProvider } from "@/components/convex-provider";
import { DevAgentation } from "@/components/agentation";

export const metadata: Metadata = {
  title: "SalesPulse",
  description: "Point of Sale & Inventory Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..800&family=Inter:ital,wght@0,400..800;1,400..800&family=JetBrains+Mono:ital,wght@0,400..800;1,400..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ConvexClientProvider><Providers>{children}</Providers></ConvexClientProvider>
        <DevAgentation />
      </body>
    </html>
  );
}
