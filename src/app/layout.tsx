import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SetList Pro — Repertório Musical",
  description: "Portal individual para músicos gerenciarem repertório e setlists",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
