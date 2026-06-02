"use client";

import { GraficoPesos } from "./GraficoPesos";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { WizardState } from "@/types";

interface Props {
  state: WizardState;
  nomeAtivo: string;
}

function RcBadge({ rc }: { rc?: number }) {
  if (rc == null) return <Badge variant="outline">Não calculado</Badge>;
  return (
    <Badge variant={rc <= 0.1 ? "success" : "destructive"}>
      RC = {rc.toFixed(4)}
    </Badge>
  );
}

export function EtapaRevisao({ state, nomeAtivo }: Props) {
  const { identificacao, criteriosAtivo, criteriosPatologia, resultadoAhpAtivo, resultadoAhpPatologia } = state;

  const pesosAtivo = criteriosAtivo.map((_, i) => resultadoAhpAtivo?.pesos[i] ?? 0);
  const pesosPatologia = criteriosPatologia.map((_, i) => resultadoAhpPatologia?.pesos[i] ?? 0);

  const formulaSA = criteriosAtivo
    .map((c, i) => `(${(pesosAtivo[i] * 100).toFixed(1)}% × ${c.nome || `Critério ${i + 1}`})`)
    .join(" + ");

  const formulaSP = criteriosPatologia
    .map((c, i) => `(${(pesosPatologia[i] * 100).toFixed(1)}% × ${c.nome || `Critério ${i + 1}`})`)
    .join(" + ");

  const ambosValidos = (resultadoAhpAtivo?.valido ?? false) && (resultadoAhpPatologia?.valido ?? false);

  return (
    <div className="space-y-6">
      {ambosValidos ? (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Ambas as matrizes são consistentes. A configuração está pronta para ativação.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Uma ou mais matrizes apresentam inconsistência (RC &gt; 0.10). Você pode salvar como
            rascunho, mas revise antes de ativar.
          </AlertDescription>
        </Alert>
      )}

      {/* Identificação */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Identificação
        </h3>
        <div className="rounded-md border p-3 space-y-1 text-sm">
          <p><strong>Nome:</strong> {identificacao.nome}</p>
          {identificacao.descricao && <p><strong>Descrição:</strong> {identificacao.descricao}</p>}
          <p><strong>Máx. Patologias:</strong> {identificacao.maxPatologiasEsperadas}</p>
        </div>
      </section>

      {/* Critérios do Ativo */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Critérios do Ativo ({criteriosAtivo.length})
          </h3>
          <RcBadge rc={resultadoAhpAtivo?.razaoConsistencia} />
        </div>
        <GraficoPesos
          criterios={criteriosAtivo.map((c) => c.nome || `Critério ${criteriosAtivo.indexOf(c) + 1}`)}
          pesos={pesosAtivo}
        />
        {formulaSA && (
          <div className="rounded-md bg-muted p-3 text-xs font-mono break-words">
            SA = {formulaSA}
          </div>
        )}
      </section>

      {/* Critérios de Patologia */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Critérios de Patologia ({criteriosPatologia.length})
          </h3>
          <RcBadge rc={resultadoAhpPatologia?.razaoConsistencia} />
        </div>
        <GraficoPesos
          criterios={criteriosPatologia.map((c) => c.nome || `Critério ${criteriosPatologia.indexOf(c) + 1}`)}
          pesos={pesosPatologia}
        />
        {formulaSP && (
          <div className="rounded-md bg-muted p-3 text-xs font-mono break-words">
            SP = {formulaSP}
          </div>
        )}
      </section>

      {/* Fórmula final */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Fórmula Final
        </h3>
        <div className="rounded-md bg-muted p-3 text-xs font-mono space-y-1">
          <p>{nomeAtivo}:</p>
          <p>SA = {formulaSA || "(defina critérios do ativo)"}</p>
          <p>SP = {formulaSP || "(defina critérios de patologia)"}</p>
          <p>FP_norm = Σ SP_k / (100 × {identificacao.maxPatologiasEsperadas})</p>
          <p>NF = SA_norm × (1 + FP_norm)</p>
        </div>
      </section>
    </div>
  );
}
