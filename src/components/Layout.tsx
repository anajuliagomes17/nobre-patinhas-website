import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Link
        to="/chat"
        aria-label="Chat Online"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-action text-action-foreground shadow-xl transition-transform hover:scale-105"
      >
        <MessageCircle className="size-6" />
      </Link>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b bg-card">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-extrabold text-primary md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
