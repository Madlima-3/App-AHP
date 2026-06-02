"use client";

import { cn } from "@/lib/utils";

const SAATY_VALORES = [9, 8, 7, 6, 5, 4, 3, 2, 1, 1 / 2, 1 / 3, 1 / 4, 1 / 5, 1 / 6, 1 / 7, 1 / 8, 1 / 9];

const SAATY_LABELS: Record<number, string> = {
  9: "9", 8: "8", 7: "7", 6: "6", 5: "5", 4: "4", 3: "3", 2: "2", 1: "1",
};

function formatarValor(v: number): string {
  if (v >= 1) return String(Math.round(v));
  const frações: Record<string, string> = {
    "0.5": "1/2", "0.333": "1/3", "0.25": "1/4", "0.2": "1/5",
    "0.167": "1/6", "0.143": "1/7", "0.125": "1/8", "0.111": "1/9",
  };
  const chave = v.toFixed(3);
  return frações[chave] ?? v.toFixed(2);
}

function corDoValor(v: number): string {
  if (v > 1) return "bg-blue-100 text-blue-800 border-blue-300";
  if (v < 1) return "bg-orange-100 text-orange-800 border-orange-300";
  return "bg-gray-100 text-gray-700 border-gray-300";
}

interface Props {
  value: number;
  onChange: (valor: number) => void;
  disabled?: boolean;
}

export function EscalaSaaty({ value, onChange, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {SAATY_VALORES.map((v) => {
        const label = formatarValor(v);
        const selecionado = Math.abs(v - value) < 1e-9;
        return (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={() => onChange(v)}
            className={cn(
              "min-w-[36px] h-8 px-1.5 text-xs font-mono rounded border transition-all",
              selecionado
                ? "ring-2 ring-primary font-bold " + corDoValor(v)
                : corDoValor(v) + " opacity-60 hover:opacity-100",
              disabled && "cursor-not-allowed opacity-30"
            )}
            title={v >= 1 ? `${Math.round(v)}× mais importante` : `${formatarValor(v)}× menos importante`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
