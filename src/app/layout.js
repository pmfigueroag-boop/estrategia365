import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { ParadigmProvider } from '@/features/plan/context/ParadigmContext';
import { ToastProvider } from '@/features/plan/context/ToastContext';
import { PlanProvider } from '@/features/plan/context/PlanContext';
import ErrorBoundary from "@/components/ErrorBoundary";
import ClientShell from "@/components/ClientShell";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/SkeletonLoader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Estrategia 365 | Institutional Strategic Workbench",
  description: "Plataforma institucional de Gestión de Portafolio Estratégico (SPM) — Planificación, Ejecución, Gobernanza y Simulación integradas.",
  keywords: ["estrategia", "planificación", "OKR", "BSC", "Hoshin Kanri", "institucional", "gobierno"],
  authors: [{ name: "Estrategia 365" }],
  robots: "noindex, nofollow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A1A2F",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <ParadigmProvider>
          <ToastProvider>
            <PlanProvider>
            <div className="app-wrapper flex-col h-full w-full" style={{ minHeight: '100vh', position: 'relative' }}>
              <Header />
              <main className="container flex-col w-full h-full" style={{ padding: '0 2rem 2rem 2rem', flex: 1 }}>
                <ClientShell>
                  <ErrorBoundary domain="Estrategia 365">
                    <Suspense fallback={<PageSkeleton />}>
                      {children}
                    </Suspense>
                  </ErrorBoundary>
                </ClientShell>
              </main>
              <BottomNav />
            </div>
            </PlanProvider>
          </ToastProvider>
        </ParadigmProvider>
      </body>
    </html>
  );
}
