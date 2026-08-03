import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { personStructuredData, site } from "@/lib/seo/site";
import { UmamiAnalytics } from "@/components/site/UmamiAnalytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "ScottWang — AI & Agent Architect", template: "%s — ScottWang" },
  description: site.description,
  authors: [{ name: site.author }],
  openGraph: { type: "website", siteName: site.name, title: "ScottWang — AI & Agent Architect", description: site.description },
  twitter: { card: "summary_large_image", title: "ScottWang — AI & Agent Architect", description: site.description },
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg" },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body className="site-grid"><PageShell>{children}</PageShell><UmamiAnalytics /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personStructuredData()) }} /></body></html>;
}
