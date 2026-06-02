import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraficoPesos } from "@/components/GraficoPesos";
import { ArrowLeft, Download, GitBranch, Plus, CheckCircle, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function DetalheAtivoPage({ params }: Props) {
  const tipo = await prisma.tipoAtivo.findUnique({
    where: { id: params.id },
    include: {
      versoes: {
        orderBy: { versao: "desc" },
        include: {
          criteriosAtivo: { include: { escalas: true }, orderBy: { ordem: "asc" } },
          criteriosPatologia: { include: { escalas: true }, orderBy: { ordem: "asc" } },
          matrizes: true,
        },
      },
    },
  });

  if (!tipo) notFound();

  const versaoAtiva = tipo.versoes.find((v) => v.status === "ativa");
  const versaoExibir = versaoAtiva ?? tipo.versoes[0];

  const matrizAtivo = versaoExibir?.matrizes.find((m) => m.tipo === "ativo");
  const matrizPatologia = versaoExibir?.matrizes.find((m) => m.tipo === "patologia");
  const rcAtivo = matrizAtivo?.razaoConsistencia;
  const rcPatologia = matrizPatologia?.razaoConsistencia;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{tipo.nome}</h1>
          {tipo.descricao && (
            <p className="text-muted-foreground text-sm">{tipo.descricao}</p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="outline" size="sm">
            <Link href={`/tipos-ativo/${tipo.id}/versoes`}>
              <GitBranch className="h-4 w-4 mr-1.5" />
              Histórico
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/tipos-ativo/${tipo.id}/editar`}>
              <Plus className="h-4 w-4 mr-1.5" />
              Nova Versão
            </Link>
          </Button>
          {versaoAtiva && (
            <Button asChild size="sm">
              <a href={`/api/export/excel?tipoAtivoId=${tipo.id}`} download>
                <Download className="h-4 w-4 mr-1.5" />
                Exportar Excel
              </a>
            </Button>
          )}
        </div>
      </div>

      {!versaoExibir ? (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Nenhuma configuração criada ainda.
            </p>
            <Button asChild>
              <Link href={`/tipos-ativo/${tipo.id}/editar`}>
                Criar configuração
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Versão {versaoExibir.versao}</span>
            <Badge
              variant={
                versaoExibir.status === "ativa"
                  ? "success"
                  : versaoExibir.status === "arquivada"
                  ? "secondary"
                  : "outline"
              }
            >
              {versaoExibir.status}
            </Badge>
            <span className="text-muted-foreground">
              Máx. {tipo.maxPatologiasEsperadas} patologias
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Critérios do Ativo */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Critérios do Ativo</CardTitle>
                  {rcAtivo != null && (
                    <div className="flex items-center gap-1 text-xs">
                      {rcAtivo <= 0.1 ? (
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className={rcAtivo <= 0.1 ? "text-green-600" : "text-red-500"}>
                        RC = {rcAtivo.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {versaoExibir.criteriosAtivo.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem critérios definidos.</p>
                ) : (
                  <GraficoPesos
                    criterios={versaoExibir.criteriosAtivo.map((c) => c.nome)}
                    pesos={versaoExibir.criteriosAtivo.map((c) => c.peso ?? 0)}
                  />
                )}
              </CardContent>
            </Card>

            {/* Critérios de Patologia */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Critérios de Patologia</CardTitle>
                  {rcPatologia != null && (
                    <div className="flex items-center gap-1 text-xs">
                      {rcPatologia <= 0.1 ? (
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span
                        className={rcPatologia <= 0.1 ? "text-green-600" : "text-red-500"}
                      >
                        RC = {rcPatologia.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {versaoExibir.criteriosPatologia.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem critérios definidos.</p>
                ) : (
                  <GraficoPesos
                    criterios={versaoExibir.criteriosPatologia.map((c) => c.nome)}
                    pesos={versaoExibir.criteriosPatologia.map((c) => c.peso ?? 0)}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Escalas de critérios */}
          {versaoExibir.criteriosAtivo.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Escalas dos Critérios do Ativo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {versaoExibir.criteriosAtivo.map((c) => (
                    <div key={c.id}>
                      <p className="text-sm font-medium mb-1">
                        {c.nome}
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          peso: {((c.peso ?? 0) * 100).toFixed(1)}%
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {c.escalas.map((e) => (
                          <div
                            key={e.id}
                            className="flex items-center gap-1.5 rounded border bg-muted px-2 py-1 text-xs"
                          >
                            <span>{e.rotulo}</span>
                            <span className="font-mono text-muted-foreground">= {e.valor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
