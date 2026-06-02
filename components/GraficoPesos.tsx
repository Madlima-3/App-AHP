"use client";

import { cn } from "@/lib/utils";

interface Props {
  criterios: string[];
  pesos: number[];
}

const CORES = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-orange-500", "bg-indigo-500",
];

export function GraficoPesos({ criterios, pesos }: Props) {
  if (criterios.length === 0 || pesos.length === 0) return null;

  return (
    <div className="space-y-2">
      {criterios.map((nome, i) => {
        const pct = ((pesos[i] ?? 0) * 100).toFixed(1);
        const cor = CORES[i % CORES.length];
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="w-32 text-xs text-right truncate text-muted-foreground" title={nome}>
              {nome}
            </span>
            <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-300", cor)}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-12 text-xs font-mono text-right">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}
