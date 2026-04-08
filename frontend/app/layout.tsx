import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "./components/BottomNav";
import { AuthProvider } from "./lib/auth-context";
import { ToastProvider } from "./components/Toast";

export const metadata: Metadata = {
  title: "S-TAG | Sikring og sporing av dine verdier",
  description: "Digital registrering, sporing og eierskifte av dine S-TAG-merkede gjenstander. Norges nye standard for eierskap og sporing.",
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
        <ToastProvider>
          <AuthProvider>
            {children}
            <BottomNav />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
