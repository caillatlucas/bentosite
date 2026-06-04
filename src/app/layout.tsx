import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CAILLAT.",
  description: "Portfolio de Lucas Caillat - Freelance Informatique",
  icons: {
    icon: "/favicon.ico",          // Corrigé : suppression de "public"
    shortcut: "/favicon.ico",      // Corrigé : suppression de "public"
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        {/* Tous les chemins /bentosite/... ont été corrigés en /... */}
        <link rel="icon" type="image/png" href="/favicon.png?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0d0d0d" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('PWA Service Worker registered with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('PWA Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans text-text-black bg-background">{children}</body>
    </html>
  );
}
