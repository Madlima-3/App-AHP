"use client";

import { useEffect, useState, useCallback } from "react";
import { EscalaSaaty } from "./EscalaSaaty";
import { GraficoPesos } from "./GraficoPesos";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { calcularAHP, preencherReciprocas, criarMatrizIdentidade } from "@/lib/ahp";
import type { ResultadoAHP } from "@/types";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface Props {
  criterios: string[];
  matrizInicial?: number[][];
  onChange?: (matriz: number[][], resultado: ResultadoAHP) => void;
}

export function MatrizAHP({ criterios, matrizInicial, onChange }: Props) {
  const n = criterios.length;

  const [matriz, setMatriz] = useState<number[][]>(() =>
    matrizInicial ?? criarMatrizIdentidade(n)
  );
  const [resultado, setResultado] = useState<ResultadoAHP | null>(null);

  useEffect(() => {
    if (n < 1) return;
    const m = matrizInicial ?? criarMatrizIdentidade(n);
    setMatriz(m);
  }, [n]);

  const recalcular = useCallback(
    (m: number[][]) => {
      if (n < 1) return;
      const res = calcularAHP(m);
      setResultado(res);
      onChange?.(m, res);
    },
    [n, onChange]
  );

  useEffect(() => {
    recalcular(matriz);
  }, []);

  function handleChange(i: number, j: number, valor: number) {
    const nova = preencherReciprocas(matriz, i, j, valor);
    setMatriz(nova);
    recalcular(nova);
  }

  if (n === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Adicione pelo menos 2 critérios para exibir a matriz.
      </p>
    );
  }

  if (n === 1) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Com apenas 1 critério, o peso é automaticamente 100%.
        </p>
        <GraficoPesos criterios={criterios} pesos={[1]} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Matriz */}
      <div className="overflow-x-auto">
        <table className="border-collapse text-sm w-full">
          <thead>
            <tr>
              <th className="p-2 text-left text-xs text-muted-foreground w-32">Critério</th>
              {criterios.map((c, j) => (
                <th key={j} className="p-2 text-center text-xs font-medium min-w-[160px]">
                  <span className="block max-w-[140px] truncate mx-auto" title={c}>
                    {c}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criterios.map((cLinha, i) => (
              <tr key={i} className="border-t">
                <td className="p-2 text-xs font-medium truncate max-w-[120px]" title={cLinha}>
                  {cLinha}
                </td>
                {criterios.map((_, j) => (
                  <td key={j} className="p-2 text-center">
                    {i === j ? (
                      <div className="flex justify-center">
                        <span className="inline-flex items-center justify-center h-8 w-10 rounded border bg-muted text-xs font-mono">
                          1
                        </span>
                      </div>
                    ) : j > i ? (
                      <EscalaSaaty
                        value={matriz[i][j]}
                        onChange={(v) => handleChange(i, j, v)}
                      />
                    ) : (
                      <div className="flex justify-center">
                        <span className="inline-flex items-center justify-center h-8 px-2 rounded border bg-muted/50 text-xs font-mono text-muted-foreground">
                          {formatarFracao(matriz[i][j])}
                        </span>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resultado RC / IC */}
      {resultado && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">IC:</span>
              <Badge variant="outline" className="font-mono">
                {resultado.indiceConsistencia.toFixed(4)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">RC:</span>
              <Badge
                variant={resultado.valido ? "success" : "destructive"}
                className="font-mono"
              >
                {resultado.razaoConsistencia.toFixed(4)}
              </Badge>
            </div>
          </div>

          {resultado.valido ? (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Matriz consistente</AlertTitle>
              <AlertDescription>
                RC = {resultado.razaoConsistencia.toFixed(4)} ≤ 0.10 — os julgamentos são aceitáveis.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Matriz inconsistente</AlertTitle>
              <AlertDescription>
                RC = {resultado.razaoConsistencia.toFixed(4)} &gt; 0.10 — recalibre os julgamentos para reduzir
                as contradições.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <p className="text-sm font-medium mb-3">Pesos resultantes:</p>
            <GraficoPesos criterios={criterios} pesos={resultado.pesos} />
          </div>
        </div>
      )}
    </div>
  );
}

function formatarFracao(v: number): string {
  if (v >= 1) return String(Math.round(v));
  const frações: Record<string, string> = {
    "0.500": "1/2", "0.333": "1/3", "0.250": "1/4", "0.200": "1/5",
    "0.167": "1/6", "0.143": "1/7", "0.125": "1/8", "0.111": "1/9",
  };
  return frações[v.toFixed(3)] ?? v.toFixed(3);
}
