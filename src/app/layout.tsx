import type { Metadata } from "next";
import { AppProviders } from "./providers";
import {
  absoluteUrl,
  createMetadata,
  jsonLd,
  organizationJsonLd,
  siteConfig,
  softwareJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Zorviq | AI Website Builder for No-Code Websites",
    description: siteConfig.description,
    path: "/",
  }),
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "AI website builder",
  icons: {
    icon: "/favicon.ico",
  },
  manifest: absoluteUrl("/manifest.webmanifest"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd([organizationJsonLd, websiteJsonLd, softwareJsonLd]),
          }}
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
