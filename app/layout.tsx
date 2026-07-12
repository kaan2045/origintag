import type { Metadata } from "next";
import { Familjen_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";

const familjenGrotesk = Familjen_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "OriginTag",
  description: "Tarım ürünleri için blockchain tabanlı QR izlenebilirlik",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${familjenGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}