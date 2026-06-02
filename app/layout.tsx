import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Priorização de Manutenção Ferroviária",
  description: "Sistema de configuração de metodologia AHP para manutenção de infraestrutura ferroviária",
};

const isEphemeralDb = process.env.DATABASE_URL?.startsWith("file:");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background font-sans antialiased">
        {isEphemeralDb && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-xs text-yellow-800 text-center">
            ⚠️ Ambiente de preview (Vercel): banco de dados em memória efêmera — dados são perdidos entre
            reinicializações do servidor. Para uso em produção, configure um banco persistente (ex: Turso, Neon).
          </div>
        )}
        <header className="border-b bg-white sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">Ferroviária</p>
                <p className="text-xs text-muted-foreground">Priorização de Manutenção</p>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
