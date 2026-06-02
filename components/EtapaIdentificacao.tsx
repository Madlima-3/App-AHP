"use client";

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import type { WizardState } from "@/types";

interface Props {
  dados: WizardState["identificacao"];
  onChange: (dados: WizardState["identificacao"]) => void;
}

export function EtapaIdentificacao({ dados, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="nome">
          Nome do tipo de ativo <span className="text-destructive">*</span>
        </Label>
        <Input
          id="nome"
          value={dados.nome}
          onChange={(e) => onChange({ ...dados, nome: e.target.value })}
          placeholder="ex: Bueiro, Talude, Cortina Atirantada"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição (opcional)</Label>
        <Textarea
          id="descricao"
          value={dados.descricao ?? ""}
          onChange={(e) => onChange({ ...dados, descricao: e.target.value })}
          placeholder="Descreva brevemente este tipo de ativo..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxPatologias">
          Máximo de patologias simultâneas esperadas
        </Label>
        <Input
          id="maxPatologias"
          type="number"
          min={1}
          max={20}
          value={dados.maxPatologiasEsperadas}
          onChange={(e) =>
            onChange({
              ...dados,
              maxPatologiasEsperadas: Math.max(1, parseInt(e.target.value) || 1),
            })
          }
          className="w-32"
        />
        <p className="text-xs text-muted-foreground">
          Usado para normalizar o Fator de Patologias (FP_norm). Default: 3. Quando excedido, uma
          flag de alerta aparece no export — o cálculo não é bloqueado.
        </p>
      </div>
    </div>
  );
}
