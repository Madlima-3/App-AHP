"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { EtapaIdentificacao } from "./EtapaIdentificacao";
import { EtapaCriterios } from "./EtapaCriterios";
import { MatrizAHP } from "./MatrizAHP";
import { EtapaRevisao } from "./EtapaRevisao";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { criarMatrizIdentidade } from "@/lib/ahp";
import type { WizardState, ResultadoAHP } from "@/types";
import { ChevronLeft, ChevronRight, Save, CheckCircle } from "lucide-react";

const ETAPAS = [
  "Identificação",
  "Critérios do Ativo",
  "Matriz AHP — Ativo",
  "Critérios de Patologia",
  "Matriz AHP — Patologia",
  "Revisão e Ativação",
];

const estadoInicial: WizardState = {
  etapa: 0,
  identificacao: { nome: "", maxPatologiasEsperadas: 3 },
  criteriosAtivo: [],
  matrizAtivo: [[1]],
  criteriosPatologia: [],
  matrizPatologia: [[1]],
};

interface Props {
  tipoAtivoId?: string;
  estadoBase?: Partial<WizardState>;
}

export function WizardConfiguracao({ tipoAtivoId, estadoBase }: Props) {
  const router = useRouter();
  const [state, setState] = useState<WizardState>({ ...estadoInicial, ...estadoBase });
  const [notas, setNotas] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const atualizarMatrizAtivo = useCallback(
    (matriz: number[][], resultado: ResultadoAHP) => {
      setState((s) => ({ ...s, matrizAtivo: matriz, resultadoAhpAtivo: resultado }));
    },
    []
  );

  const atualizarMatrizPatologia = useCallback(
    (matriz: number[][], resultado: ResultadoAHP) => {
      setState((s) => ({ ...s, matrizPatologia: matriz, resultadoAhpPatologia: resultado }));
    },
    []
  );

  const podeAvancar = (): boolean => {
    switch (state.etapa) {
      case 0:
        return state.identificacao.nome.trim().length > 0;
      case 1:
        return (
          state.criteriosAtivo.length >= 2 &&
          state.criteriosAtivo.every(
            (c) => c.nome.trim() && c.escalas.length >= 1 && c.escalas.every((e) => e.rotulo.trim())
          )
        );
      case 2:
        return true;
      case 3:
        return (
          state.criteriosPatologia.length >= 2 &&
          state.criteriosPatologia.every(
            (c) => c.nome.trim() && c.escalas.length >= 1 && c.escalas.every((e) => e.rotulo.trim())
          )
        );
      case 4:
        return true;
      default:
        return true;
    }
  };

  async function salvar(statusFinal: "rascunho" | "ativa") {
    setSalvando(true);
    setErro(null);

    const payload = {
      tipoAtivoId: tipoAtivoId ?? "__novo__",
      notas,
      status: statusFinal,
      criteriosAtivo: state.criteriosAtivo.map((c, i) => ({
        nome: c.nome,
        descricao: c.descricao,
        ordem: i,
        escalas: c.escalas,
      })),
      criteriosPatologia: state.criteriosPatologia.map((c, i) => ({
        nome: c.nome,
        descricao: c.descricao,
        ordem: i,
        escalas: c.escalas,
      })),
      matrizAtivo: state.resultadoAhpAtivo
        ? {
            tipo: "ativo",
            dadosMatriz: state.matrizAtivo,
            indiceConsistencia: state.resultadoAhpAtivo.indiceConsistencia,
            razaoConsistencia: state.resultadoAhpAtivo.razaoConsistencia,
            valido: state.resultadoAhpAtivo.valido,
          }
        : undefined,
      matrizPatologia: state.resultadoAhpPatologia
        ? {
            tipo: "patologia",
            dadosMatriz: state.matrizPatologia,
            indiceConsistencia: state.resultadoAhpPatologia.indiceConsistencia,
            razaoConsistencia: state.resultadoAhpPatologia.razaoConsistencia,
            valido: state.resultadoAhpPatologia.valido,
          }
        : undefined,
      pesosAtivo: state.resultadoAhpAtivo?.pesos,
      pesosPatologia: state.resultadoAhpPatologia?.pesos,
    };

    // Se criando novo tipo de ativo, criar primeiro
    let taId = tipoAtivoId;
    if (!taId) {
      const respTipo = await fetch("/api/tipos-ativo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: state.identificacao.nome,
          descricao: state.identificacao.descricao,
          maxPatologiasEsperadas: state.identificacao.maxPatologiasEsperadas,
        }),
      });

      if (!respTipo.ok) {
        setErro("Erro ao criar tipo de ativo.");
        setSalvando(false);
        return;
      }
      const tipo = await respTipo.json();
      taId = tipo.id;
    }

    const resp = await fetch("/api/configuracoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, tipoAtivoId: taId }),
    });

    if (!resp.ok) {
      setErro("Erro ao salvar configuração.");
      setSalvando(false);
      return;
    }

    router.push(`/tipos-ativo/${taId}`);
  }

  const matrizAtivoKey = state.criteriosAtivo.map((c) => c.nome).join("|");
  const matrizPatologiaKey = state.criteriosPatologia.map((c) => c.nome).join("|");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progresso */}
      <nav className="flex items-center gap-1 overflow-x-auto pb-2">
        {ETAPAS.map((label, i) => (
          <div key={i} className="flex items-center shrink-0">
            <div
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                i === state.etapa
                  ? "bg-primary text-primary-foreground"
                  : i < state.etapa
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              <span className="font-mono">{i + 1}</span>
              <span className="hidden sm:inline">{label}</span>
            </div>
            {i < ETAPAS.length - 1 && (
              <div className={`mx-1 h-px w-4 ${i < state.etapa ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </nav>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Etapa {state.etapa + 1}: {ETAPAS[state.etapa]}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {state.etapa === 0 && (
            <EtapaIdentificacao
              dados={state.identificacao}
              onChange={(id) => setState((s) => ({ ...s, identificacao: id }))}
            />
          )}

          {state.etapa === 1 && (
            <EtapaCriterios
              criterios={state.criteriosAtivo}
              onChange={(c) => {
                setState((s) => ({
                  ...s,
                  criteriosAtivo: c,
                  matrizAtivo: criarMatrizIdentidade(c.length),
                  resultadoAhpAtivo: undefined,
                }));
              }}
              titulo="critério do ativo"
            />
          )}

          {state.etapa === 2 && (
            <MatrizAHP
              key={matrizAtivoKey}
              criterios={state.criteriosAtivo.map((c) => c.nome)}
              matrizInicial={
                state.matrizAtivo.length === state.criteriosAtivo.length
                  ? state.matrizAtivo
                  : criarMatrizIdentidade(state.criteriosAtivo.length)
              }
              onChange={atualizarMatrizAtivo}
            />
          )}

          {state.etapa === 3 && (
            <EtapaCriterios
              criterios={state.criteriosPatologia}
              onChange={(c) => {
                setState((s) => ({
                  ...s,
                  criteriosPatologia: c,
                  matrizPatologia: criarMatrizIdentidade(c.length),
                  resultadoAhpPatologia: undefined,
                }));
              }}
              titulo="critério de patologia"
            />
          )}

          {state.etapa === 4 && (
            <MatrizAHP
              key={matrizPatologiaKey}
              criterios={state.criteriosPatologia.map((c) => c.nome)}
              matrizInicial={
                state.matrizPatologia.length === state.criteriosPatologia.length
                  ? state.matrizPatologia
                  : criarMatrizIdentidade(state.criteriosPatologia.length)
              }
              onChange={atualizarMatrizPatologia}
            />
          )}

          {state.etapa === 5 && (
            <div className="space-y-6">
              <EtapaRevisao state={state} nomeAtivo={state.identificacao.nome} />
              <div className="space-y-2">
                <Label>Notas sobre esta versão (opcional)</Label>
                <Textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Descreva o que mudou nesta versão..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {erro && <p className="mt-4 text-sm text-destructive">{erro}</p>}
        </CardContent>

        <CardFooter className="flex justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={state.etapa === 0}
            onClick={() => setState((s) => ({ ...s, etapa: s.etapa - 1 }))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>

          <div className="flex gap-2">
            {state.etapa < ETAPAS.length - 1 ? (
              <Button
                type="button"
                disabled={!podeAvancar()}
                onClick={() => setState((s) => ({ ...s, etapa: s.etapa + 1 }))}
              >
                Avançar <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={salvando}
                  onClick={() => salvar("rascunho")}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {salvando ? "Salvando..." : "Salvar Rascunho"}
                </Button>
                <Button
                  type="button"
                  disabled={salvando}
                  onClick={() => salvar("ativa")}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {salvando ? "Ativando..." : "Ativar esta Versão"}
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
