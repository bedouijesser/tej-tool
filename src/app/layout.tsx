import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Consultation Dossier Fiscal Tunisie | Vérification MATF en Ligne',
  description: 'Vérifiez votre situation fiscale en Tunisie et téléchargez votre dossier fiscal officiel directement via le portail TEJ du Ministère des Finances',
  keywords: ['dossier fiscal tunisie', 'vérification MATF', 'situation fiscale', 'TEJ finances', 'télécharger document fiscal', 'ministère des finances'],
  
  openGraph: {
    title: 'Consultation Dossier Fiscal Tunisie',
    description: 'Service agréé de consultation des dossiers fiscaux tunisiens',
    url: 'https://luca-pacioli-tej-tool.vercel.app/',
    type: 'website',
    locale: 'fr_TN',
    siteName: 'LucaPacioli Fiscal',
    images: [
      {
        url: '/og-image.jpeg',
        width: 1200,
        height: 630,
        alt: 'Interface de consultation fiscale LucaPacioli',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    site: '@LucaPacioliTN',
    title: 'Consultation Dossier Fiscal Tunisie',
    description: 'Vérifiez et téléchargez votre dossier fiscal tunisien en ligne',
    images: ['https://luca-pacioli-tej-tool.vercel.app//og-image.jpeg'],
  },
  
  alternates: {
    canonical: 'https://luca-pacioli-tej-tool.vercel.app/',
  },
  
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },
  
  
  icons: {
    icon: '/favicon.ico',
  },
  
  themeColor: '#ffffff',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
