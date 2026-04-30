import { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteNav } from "./SiteNav";

export const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <SiteNav />
      <main className="container pb-20 animate-fade-in">{children}</main>
      <footer className="hero-header py-6 mt-10">
        <div className="container relative z-10 text-center text-white/80 font-ui text-sm">
          © 2026 — Colégio Mundial · Itinerário Formativo: Jogos, Cultura e Sociedade
        </div>
      </footer>
    </div>
  );
};
