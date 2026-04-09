import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "./components/BottomNav";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./lib/auth-context";
import { ToastProvider } from "./components/Toast";
import { I18nProvider } from "./lib/i18n";

export const metadata: Metadata = {
  title: "S-TAG | Innebygd sikring for det du eier",
  description:
    "S-TAG-chipen støpes inn i produktet av produsenten under produksjon. Registrer, spor og overfør eierskapet digitalt – helt gratis.",
  applicationName: "S-TAG",
  authors: [{ name: "S-TAG" }],
  keywords: [
    "S-TAG",
    "sporing",
    "NFC",
    "eierskap",
    "sykkel",
    "ski",
    "elsparkesykkel",
    "gjenkjenning",
    "anti-tyveri",
  ],
  openGraph: {
    type: "website",
    locale: "nb_NO",
    title: "S-TAG | Innebygd sikring for det du eier",
    description:
      "Innebygd fra fabrikken av produsenten. Registrer, spor og overfør eierskapet digitalt – helt gratis.",
    siteName: "S-TAG",
  },
  twitter: {
    card: "summary_large_image",
    title: "S-TAG | Innebygd sikring for det du eier",
    description:
      "Innebygd fra fabrikken. Registrer, spor og overfør eierskapet digitalt.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <ErrorBoundary>
          <I18nProvider>
            <ToastProvider>
              <AuthProvider>
                {children}
                <BottomNav />
              </AuthProvider>
            </ToastProvider>
          </I18nProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
