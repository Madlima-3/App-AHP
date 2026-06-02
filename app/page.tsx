import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, GitBranch, Download } from "lucide-react";

export const dynamic = "force-dynamic";

async function getTiposAtivo() {
  return prisma.tipoAtivo.findMany({
    orderBy: { criadoEm: "desc" },
    include: {
      versoes: {
        orderBy: { versao: "desc" },
        take: 1,
      },
    },
  });
}

function StatusBadge({ status }: { status: string | undefined }) {
  if (!status) return <Badge variant="outline">Sem versão</Badge>;
  const variant =
    status === "ativa" ? "success" : status === "arquivada" ? "secondary" : "outline";
  return (
    <Badge variant={variant as "success" | "secondary" | "outline"}>{status}</Badge>
  );
}

export default async function DashboardPage() {
  const tipos = await getTiposAtivo();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tipos de Ativo</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure metodologias AHP para cada tipo de ativo ferroviário
          </p>
        </div>
        <Button asChild>
          <Link href="/tipos-ativo/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo Tipo de Ativo
          </Link>
        </Button>
      </div>

      {tipos.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Nenhum tipo de ativo cadastrado ainda.
            </p>
            <Button asChild>
              <Link href="/tipos-ativo/novo">
                <Plus className="h-4 w-4 mr-2" />
                Criar primeiro tipo de ativo
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tipos.map((tipo) => {
            const ultimaVersao = tipo.versoes[0];
            return (
              <Card key={tipo.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{tipo.nome}</CardTitle>
                    <StatusBadge status={ultimaVersao?.status} />
                  </div>
                  {tipo.descricao && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {tipo.descricao}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    {ultimaVersao ? (
                      <span>Versão {ultimaVersao.versao}</span>
                    ) : (
                      <span>Sem configuração</span>
                    )}
                    <span className="mx-1">·</span>
                    <span>Máx. {tipo.maxPatologiasEsperadas} pat.</span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/tipos-ativo/${tipo.id}`}>
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        Detalhes
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/tipos-ativo/${tipo.id}/versoes`}>
                        <GitBranch className="h-3.5 w-3.5 mr-1.5" />
                        Versões
                      </Link>
                    </Button>
                    {ultimaVersao?.status === "ativa" && (
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <a href={`/api/export/excel?tipoAtivoId=${tipo.id}`} download>
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                          Excel
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
