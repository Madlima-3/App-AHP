"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import type { FormCriterio, FormEscala } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  criterios: FormCriterio[];
  onChange: (criterios: FormCriterio[]) => void;
  titulo?: string;
}

export function EtapaCriterios({ criterios, onChange, titulo = "critério" }: Props) {
  const [expandido, setExpandido] = useState<Record<number, boolean>>({});

  function adicionarCriterio() {
    const novo: FormCriterio = {
      nome: "",
      descricao: "",
      ordem: criterios.length,
      escalas: [
        { rotulo: "", valor: 1 },
        { rotulo: "", valor: 3 },
        { rotulo: "", valor: 5 },
      ],
    };
    onChange([...criterios, novo]);
    setExpandido((prev) => ({ ...prev, [criterios.length]: true }));
  }

  function removerCriterio(idx: number) {
    onChange(criterios.filter((_, i) => i !== idx).map((c, i) => ({ ...c, ordem: i })));
  }

  function atualizarCriterio(idx: number, campo: keyof FormCriterio, valor: string) {
    onChange(criterios.map((c, i) => (i === idx ? { ...c, [campo]: valor } : c)));
  }

  function adicionarEscala(criterioIdx: number) {
    const novas = [
      ...criterios[criterioIdx].escalas,
      { rotulo: "", valor: 0 },
    ];
    onChange(criterios.map((c, i) => (i === criterioIdx ? { ...c, escalas: novas } : c)));
  }

  function removerEscala(criterioIdx: number, escalaIdx: number) {
    const novas = criterios[criterioIdx].escalas.filter((_, i) => i !== escalaIdx);
    onChange(criterios.map((c, i) => (i === criterioIdx ? { ...c, escalas: novas } : c)));
  }

  function atualizarEscala(criterioIdx: number, escalaIdx: number, campo: keyof FormEscala, valor: string) {
    const novas = criterios[criterioIdx].escalas.map((e, i) =>
      i === escalaIdx
        ? { ...e, [campo]: campo === "valor" ? parseFloat(valor) || 0 : valor }
        : e
    );
    onChange(criterios.map((c, i) => (i === criterioIdx ? { ...c, escalas: novas } : c)));
  }

  function moverCriterio(idx: number, direcao: -1 | 1) {
    const novoIdx = idx + direcao;
    if (novoIdx < 0 || novoIdx >= criterios.length) return;
    const novos = [...criterios];
    [novos[idx], novos[novoIdx]] = [novos[novoIdx], novos[idx]];
    onChange(novos.map((c, i) => ({ ...c, ordem: i })));
  }

  return (
    <div className="space-y-4">
      {criterios.map((criterio, idx) => (
        <Card key={idx} className="border">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moverCriterio(idx, -1)}
                  disabled={idx === 0}
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moverCriterio(idx, 1)}
                  disabled={idx === criterios.length - 1}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
              <Input
                value={criterio.nome}
                onChange={(e) => atualizarCriterio(idx, "nome", e.target.value)}
                placeholder={`Nome do ${titulo}`}
                className="flex-1 h-8 text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setExpandido((p) => ({ ...p, [idx]: !p[idx] }))}
              >
                {expandido[idx] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive shrink-0"
                onClick={() => removerCriterio(idx)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {expandido[idx] && (
            <CardContent className="pt-0 px-4 pb-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Descrição (opcional)</Label>
                <Input
                  value={criterio.descricao ?? ""}
                  onChange={(e) => atualizarCriterio(idx, "descricao", e.target.value)}
                  placeholder="Descrição do critério..."
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Escala de valores</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => adicionarEscala(idx)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Adicionar nível
                  </Button>
                </div>

                <div className="space-y-2">
                  {criterio.escalas.map((escala, eIdx) => (
                    <div key={eIdx} className="flex gap-2 items-center">
                      <Input
                        value={escala.rotulo}
                        onChange={(e) => atualizarEscala(idx, eIdx, "rotulo", e.target.value)}
                        placeholder="Rótulo (ex: Adequada)"
                        className="flex-1 h-8 text-sm"
                      />
                      <Input
                        type="number"
                        step="0.1"
                        value={escala.valor}
                        onChange={(e) => atualizarEscala(idx, eIdx, "valor", e.target.value)}
                        placeholder="Valor"
                        className="w-24 h-8 text-sm font-mono"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive shrink-0"
                        onClick={() => removerEscala(idx, eIdx)}
                        disabled={criterio.escalas.length <= 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={adicionarCriterio}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar {titulo}
      </Button>

      {criterios.length < 2 && (
        <p className="text-xs text-muted-foreground text-center">
          Adicione pelo menos 2 {titulo}s para avançar.
        </p>
      )}
    </div>
  );
}
