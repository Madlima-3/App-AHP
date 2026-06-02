"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComparacaoVersoes } from "@/components/ComparacaoVersoes";
import { ArrowLeft, RefreshCw, GitCompare } from "lucide-react";
import type { VersaoConfiguracao } from "@/types";

export default function HistoricoVersoesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [versoes, setVersoes] = useState<VersaoConfiguracao[]>([]);
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [reativando, setReativando] = useState<string | null>(null);
  const [nomeAtivo, setNomeAtivo] = useState("");

  useEffect(() => {
    fetch(`/api/tipos-ativo/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setNomeAtivo(data.nome);
        // Parse dadosMatriz de JSON string para objeto
        const versoesFormatadas = (data.versoes ?? []).map((v: VersaoConfiguracao & { matrizes: { dadosMatriz: string; tipo: string }[] }) => ({
          ...v,
          matrizes: v.matrizes.map((m) => ({
            ...m,
            dadosMatriz:
              typeof m.dadosMatriz === "string" ? JSON.parse(m.dadosMatriz) : m.dadosMatriz,
          })),
        }));
        setVersoes(versoesFormatadas);
      });
  }, [id]);

  async function reativar(versaoId: string) {
    setReativando(versaoId);
    await fetch(`/api/configuracoes/${versaoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ativa" }),
    });
    setReativando(null);
    router.refresh();
    // Recarregar dados
    const r = await fetch(`/api/tipos-ativo/${id}`);
    const data = await r.json();
    const versoesFormatadas = (data.versoes ?? []).map((v: VersaoConfiguracao & { matrizes: { dadosMatriz: string; tipo: string }[] }) => ({
      ...v,
      matrizes: v.matrizes.map((m) => ({
        ...m,
        dadosMatriz:
          typeof m.dadosMatriz === "string" ? JSON.parse(m.dadosMatriz) : m.dadosMatriz,
      })),
    }));
    setVersoes(versoesFormatadas);
  }

  function toggleSelecionada(versaoId: string) {
    setSelecionadas((prev) => {
      if (prev.includes(versaoId)) return prev.filter((id) => id !== versaoId);
      if (prev.length >= 2) return [prev[1], versaoId];
      return [...prev, versaoId];
    });
  }

  const versaoComparA = versoes.find((v) => v.id === selecionadas[0]);
  const versaoComparB = versoes.find((v) => v.id === selecionadas[1]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/tipos-ativo/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> {nomeAtivo || "Voltar"}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Histórico de Versões</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Selecione até 2 versões para comparar lado a lado.
      </p>

      <div className="space-y-3">
        {versoes.map((v) => {
          const matrizAtivo = v.matrizes?.find((m) => m.tipo === "ativo");
          const matrizPat = v.matrizes?.find((m) => m.tipo === "patologia");
          const selecionada = selecionadas.includes(v.id);

          return (
            <Card
              key={v.id}
              className={`cursor-pointer transition-all ${selecionada ? "ring-2 ring-primary" : ""}`}
              onClick={() => toggleSelecionada(v.id)}
            >
              <CardContent className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selecionada ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}
                  >
                    {selecionada && (
                      <span className="text-white text-xs font-bold">
                        {selecionadas.indexOf(v.id) + 1}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Versão {v.versao}</span>
                      <Badge
                        variant={
                          v.status === "ativa"
                            ? "success"
                            : v.status === "arquivada"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {v.status}
                      </Badge>
                    </div>
                    {v.notas && (
                      <p className="text-xs text-muted-foreground mt-0.5">{v.notas}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(v.criadoEm).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {matrizAtivo?.razaoConsistencia != null && (
                    <span>
                      RC Ativo:{" "}
                      <span
                        className={
                          matrizAtivo.razaoConsistencia <= 0.1
                            ? "text-green-600 font-mono"
                            : "text-red-500 font-mono"
                        }
                      >
                        {matrizAtivo.razaoConsistencia.toFixed(4)}
                      </span>
                    </span>
                  )}
                  {matrizPat?.razaoConsistencia != null && (
                    <span>
                      RC Pat.:{" "}
                      <span
                        className={
                          matrizPat.razaoConsistencia <= 0.1
                            ? "text-green-600 font-mono"
                            : "text-red-500 font-mono"
                        }
                      >
                        {matrizPat.razaoConsistencia.toFixed(4)}
                      </span>
                    </span>
                  )}

                  {v.status !== "ativa" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      disabled={reativando === v.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        reativar(v.id);
                      }}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      {reativando === v.id ? "Reativando..." : "Reativar"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparação */}
      {versaoComparA && versaoComparB && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GitCompare className="h-4 w-4" />
              Comparação: Versão {versaoComparA.versao} vs Versão {versaoComparB.versao}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ComparacaoVersoes versaoA={versaoComparA} versaoB={versaoComparB} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
