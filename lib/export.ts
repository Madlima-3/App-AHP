import * as XLSX from "xlsx";
import type { ExportData } from "@/types";
import { gerarFormulaTexto } from "./scoring";

function percentual(valor: number | null | undefined): string {
  if (valor == null) return "-";
  return `${(valor * 100).toFixed(2)}%`;
}

function rcFormatado(valor: number | null | undefined): string {
  if (valor == null) return "-";
  const status = valor <= 0.1 ? " ✓" : " ✗ INVÁLIDO";
  return `${valor.toFixed(4)}${status}`;
}

export function gerarExcel(data: ExportData): Buffer {
  const wb = XLSX.utils.book_new();

  const {
    tipoAtivo,
    versao,
    criteriosAtivo,
    criteriosPatologia,
    matrizAtivo,
    matrizPatologia,
  } = data;

  const rcAtivo = matrizAtivo?.razaoConsistencia;
  const rcPatologia = matrizPatologia?.razaoConsistencia;

  const formulaTexto = gerarFormulaTexto(
    tipoAtivo.nome,
    criteriosAtivo,
    criteriosPatologia,
    tipoAtivo.maxPatologiasEsperadas
  );

  // Aba 1 — Resumo
  const resumoRows = [
    ["Tipo de Ativo", tipoAtivo.nome],
    ["Descrição", tipoAtivo.descricao ?? "-"],
    ["Versão", versao.versao],
    ["Status", versao.status],
    ["Data de criação", versao.criadoEm.toISOString()],
    ["Max. Patologias Esperadas", tipoAtivo.maxPatologiasEsperadas],
    [],
    ["RC Matriz de Ativo", rcFormatado(rcAtivo)],
    ["RC Matriz de Patologia", rcFormatado(rcPatologia)],
    [],
    ["Fórmula (linguagem natural)"],
    ...formulaTexto.split("\n").map((linha) => [linha]),
  ];
  const wsResumo = XLSX.utils.aoa_to_sheet(resumoRows);
  XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

  // Aba 2 — Pesos Critérios Ativo
  const headerAtivo = ["Critério", "Peso (%)", "Escalas disponíveis", "Valores"];
  const rowsAtivo = criteriosAtivo.map((c) => {
    const escalas = c.escalas ?? [];
    return [
      c.nome,
      percentual(c.peso),
      escalas.map((e) => e.rotulo).join(" | "),
      escalas.map((e) => e.valor).join(" | "),
    ];
  });
  const wsAtivo = XLSX.utils.aoa_to_sheet([headerAtivo, ...rowsAtivo]);
  XLSX.utils.book_append_sheet(wb, wsAtivo, "Pesos Critérios Ativo");

  // Aba 3 — Pesos Critérios Patologia
  const headerPatologia = ["Critério", "Peso (%)", "Escalas disponíveis", "Valores"];
  const rowsPatologia = criteriosPatologia.map((c) => {
    const escalas = c.escalas ?? [];
    return [
      c.nome,
      percentual(c.peso),
      escalas.map((e) => e.rotulo).join(" | "),
      escalas.map((e) => e.valor).join(" | "),
    ];
  });
  const wsPatologia = XLSX.utils.aoa_to_sheet([headerPatologia, ...rowsPatologia]);
  XLSX.utils.book_append_sheet(wb, wsPatologia, "Pesos Critérios Patologia");

  // Aba 4 — Fórmula Detalhada
  const pesosAtivo = criteriosAtivo
    .map((c) => `(${percentual(c.peso)} × ${c.nome})`)
    .join(" + ");
  const pesosPatologia = criteriosPatologia
    .map((c) => `(${percentual(c.peso)} × ${c.nome})`)
    .join(" + ");

  const formulaDetalhadaRows = [
    ["FÓRMULAS DETALHADAS"],
    [],
    ["Score do Ativo (SA)"],
    [`SA = ${pesosAtivo}`],
    [],
    ["Score de Patologia (SP)"],
    [`SP = ${pesosPatologia}`],
    [],
    ["Fator de Patologias (FP)"],
    [`FP = Σ SP_k  (soma de todos os SP normalizados)`],
    [`FP_norm = FP / (100 × ${tipoAtivo.maxPatologiasEsperadas})`],
    [],
    ["Nota Final (NF)"],
    [`NF = SA_norm × (1 + FP_norm)`],
    [`NF_final = (NF - NF_min) / (NF_max - NF_min) × 100`],
    [],
    ["EXEMPLO COM VALORES FICTÍCIOS"],
    ["Parâmetro", "Valor Exemplo"],
    ["SA_norm", 70],
    ["SP_1_norm", 60],
    ["SP_2_norm", 40],
    ["FP", "60 + 40 = 100"],
    [`FP_norm`, `100 / (100 × ${tipoAtivo.maxPatologiasEsperadas}) = ${(1 / tipoAtivo.maxPatologiasEsperadas).toFixed(4)}`],
    ["NF", `70 × (1 + ${(1 / tipoAtivo.maxPatologiasEsperadas).toFixed(4)}) = ${(70 * (1 + 1 / tipoAtivo.maxPatologiasEsperadas)).toFixed(2)}`],
  ];
  const wsFormula = XLSX.utils.aoa_to_sheet(formulaDetalhadaRows);
  XLSX.utils.book_append_sheet(wb, wsFormula, "Fórmula Detalhada");

  // Aba 5 — Matriz AHP Ativo
  if (matrizAtivo?.dadosMatriz) {
    const nAtivo = criteriosAtivo.length;
    const nomes = criteriosAtivo.map((c) => c.nome);
    const headerMatrizAtivo = ["", ...nomes, "Peso"];
    const rowsMatrizAtivo = matrizAtivo.dadosMatriz.map((row, i) => [
      nomes[i],
      ...row.map((v) => parseFloat(v.toFixed(4))),
      percentual(criteriosAtivo[i]?.peso),
    ]);
    const rodapeAtivo = [
      [],
      ["Nº de critérios", nAtivo],
      ["Índice de Consistência (IC)", matrizAtivo.indiceConsistencia?.toFixed(4) ?? "-"],
      ["Razão de Consistência (RC)", rcFormatado(rcAtivo)],
    ];
    const wsMatrizAtivo = XLSX.utils.aoa_to_sheet([
      headerMatrizAtivo,
      ...rowsMatrizAtivo,
      ...rodapeAtivo,
    ]);
    XLSX.utils.book_append_sheet(wb, wsMatrizAtivo, "Matriz AHP Ativo");
  }

  // Aba 6 — Matriz AHP Patologia
  if (matrizPatologia?.dadosMatriz) {
    const nPatologia = criteriosPatologia.length;
    const nomesP = criteriosPatologia.map((c) => c.nome);
    const headerMatrizP = ["", ...nomesP, "Peso"];
    const rowsMatrizP = matrizPatologia.dadosMatriz.map((row, i) => [
      nomesP[i],
      ...row.map((v) => parseFloat(v.toFixed(4))),
      percentual(criteriosPatologia[i]?.peso),
    ]);
    const rodapeP = [
      [],
      ["Nº de critérios", nPatologia],
      ["Índice de Consistência (IC)", matrizPatologia.indiceConsistencia?.toFixed(4) ?? "-"],
      ["Razão de Consistência (RC)", rcFormatado(rcPatologia)],
    ];
    const wsMatrizP = XLSX.utils.aoa_to_sheet([
      headerMatrizP,
      ...rowsMatrizP,
      ...rodapeP,
    ]);
    XLSX.utils.book_append_sheet(wb, wsMatrizP, "Matriz AHP Patologia");
  }

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return buf;
}
