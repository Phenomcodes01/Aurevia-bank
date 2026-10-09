import type { ReactNode } from "react";
import { BankingCard, Logo } from "./primitives";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-10 sm:px-12">
        <Logo />
        <div className="mx-auto my-auto w-full max-w-md py-10">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-gradient-navy lg:flex lg:items-center lg:justify-center">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary-glow/30 blur-3xl" aria-hidden />
        <div className="relative w-96">
          <BankingCard tone="primary" className="animate-float" />
          <BankingCard tone="glass" label="Aurevia Bank Travel" last4="9013" className="animate-float-slow -mt-24 ml-16" />
          <p className="mt-12 text-center font-display text-2xl font-semibold text-navy-foreground">Banking, beautifully simple.</p>
        </div>
      </div>
    </main>
  );
}
