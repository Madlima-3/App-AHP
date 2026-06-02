"use client";

import { Badge } from "./ui/badge";
import type { VersaoConfiguracao } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  versaoA: VersaoConfiguracao;
  versaoB: VersaoConfiguracao;
}

function PesoBar({ peso }: { peso: number | null | undefined }) {
  const pct = (peso ?? 0) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-muted rounded-full h-2">
        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono w-12 text-right">{pct.toFixed(1)}%</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "ativa" ? "success" : status === "arquivada" ? "secondary" : "outline";
  return <Badge variant={variant as "success" | "secondary" | "outline"}>{status}</Badge>;
}

export function ComparacaoVersoes({ versaoA, versaoB }: Props) {
  const criteriosA = versaoA.criteriosAtivo ?? [];
  const criteriosB = versaoB.criteriosAtivo ?? [];
  const patologiasA = versaoA.criteriosPatologia ?? [];
  const patologiasB = versaoB.criteriosPatologia ?? [];

  const matrizAtivoA = versaoA.matrizes?.find((m) => m.tipo === "ativo");
  const matrizAtivoB = versaoB.matrizes?.find((m) => m.tipo === "ativo");
  const matrizPatA = versaoA.matrizes?.find((m) => m.tipo === "patologia");
  const matrizPatB = versaoB.matrizes?.find((m) => m.tipo === "patologia");

  return (
    <div className="grid grid-cols-2 gap-6 text-sm">
      {/* Cabeçalhos */}
      {[versaoA, versaoB].map((v) => (
        <div key={v.id} className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">Versão {v.versao}</span>
            <StatusBadge status={v.status} />
          </div>
          {v.notas && <p className="text-xs text-muted-foreground">{v.notas}</p>}
          <p className="text-xs text-muted-foreground">
            Criada em {new Date(v.criadoEm).toLocaleDateString("pt-BR")}
          </p>
        </div>
      ))}

      {/* Critérios do Ativo */}
      <div className="col-span-2 border-t pt-4">
        <h3 className="font-medium mb-3 uppercase text-xs tracking-wide text-muted-foreground">
          Critérios do Ativo
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {[
            { criterios: criteriosA, rc: matrizAtivoA?.razaoConsistencia },
            { criterios: criteriosB, rc: matrizAtivoB?.razaoConsistencia },
          ].map(({ criterios, rc }, col) => (
            <div key={col} className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                RC:{" "}
                <span
                  className={cn(
                    "font-mono",
                    rc != null && rc <= 0.1 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {rc?.toFixed(4) ?? "-"}
                </span>
              </div>
              {criterios.map((c) => (
                <div key={c.id} className="space-y-1">
                  <span className="text-xs font-medium">{c.nome}</span>
                  <PesoBar peso={c.peso} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Critérios de Patologia */}
      <div className="col-span-2 border-t pt-4">
        <h3 className="font-medium mb-3 uppercase text-xs tracking-wide text-muted-foreground">
          Critérios de Patologia
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {[
            { criterios: patologiasA, rc: matrizPatA?.razaoConsistencia },
            { criterios: patologiasB, rc: matrizPatB?.razaoConsistencia },
          ].map(({ criterios, rc }, col) => (
            <div key={col} className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                RC:{" "}
                <span
                  className={cn(
                    "font-mono",
                    rc != null && rc <= 0.1 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {rc?.toFixed(4) ?? "-"}
                </span>
              </div>
              {criterios.map((c) => (
                <div key={c.id} className="space-y-1">
                  <span className="text-xs font-medium">{c.nome}</span>
                  <PesoBar peso={c.peso} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
