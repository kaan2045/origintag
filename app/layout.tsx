import type { Metadata } from "next";
import { Manrope, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";

const manrope = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://origintag.com.tr"),
  title: {
    default: "OriginTag — Blockchain Tabanlı Ürün Doğrulama",
    template: "%s | OriginTag",
  },
  description: "OriginTag, tarım ürünleri için blockchain tabanlı QR izlenebilirlik ve doğrulama platformu. Zeytinyağı, bal, peynir ve daha fazlası için sahtecilik önleme ve menşe doğrulama.",
  keywords: ["OriginTag", "origintag", "blockchain izlenebilirlik", "QR doğrulama", "tarım ürünü doğrulama", "sahtecilik önleme", "menşe doğrulama"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "OriginTag — Blockchain Tabanlı Ürün Doğrulama",
    description: "Tarım ürünleri için blockchain tabanlı QR izlenebilirlik ve doğrulama platformu.",
    url: "https://origintag.com.tr",
    siteName: "OriginTag",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "OriginTag — Blockchain Tabanlı Ürün Doğrulama",
    description: "Tarım ürünleri için blockchain tabanlı QR izlenebilirlik ve doğrulama platformu.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "OriginTag",
  alternateName: "Origintag",
  url: "https://origintag.com.tr",
  logo: "https://origintag.com.tr/origin.png",
  description: "Tarım ürünleri için blockchain tabanlı QR izlenebilirlik ve doğrulama platformu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${manrope.variable} ${hankenGrotesk.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}