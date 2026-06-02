import type {
  CriterioAtivo,
  CriterioPatologia,
  ScoreAtivo,
  ScorePatologia,
  FatorPatologias,
  NotaFinal,
} from "@/types";

function calcularMinMax(
  criterios: (CriterioAtivo | CriterioPatologia)[]
): { min: number; max: number } {
  let min = 0;
  let max = 0;

  for (const criterio of criterios) {
    const escalas = criterio.escalas ?? [];
    if (escalas.length === 0) continue;
    const valores = escalas.map((e) => e.valor);
    const peso = criterio.peso ?? 0;
    min += peso * Math.min(...valores);
    max += peso * Math.max(...valores);
  }

  return { min, max };
}

function normalizar(valor: number, min: number, max: number): number {
  if (max === min) return 0;
  return ((valor - min) / (max - min)) * 100;
}

export function calcularScoreAtivo(
  criterios: CriterioAtivo[],
  valoresSelecionados: Record<string, number>
): ScoreAtivo {
  let sa = 0;

  for (const criterio of criterios) {
    const peso = criterio.peso ?? 0;
    const valor = valoresSelecionados[criterio.id] ?? 0;
    sa += peso * valor;
  }

  const { min: saMin, max: saMax } = calcularMinMax(criterios);
  const saNormalizado = normalizar(sa, saMin, saMax);

  return { sa, saMin, saMax, saNormalizado };
}

export function calcularScorePatologia(
  criterios: CriterioPatologia[],
  valoresSelecionados: Record<string, number>
): ScorePatologia {
  let sp = 0;

  for (const criterio of criterios) {
    const peso = criterio.peso ?? 0;
    const valor = valoresSelecionados[criterio.id] ?? 0;
    sp += peso * valor;
  }

  const { min: spMin, max: spMax } = calcularMinMax(criterios);
  const spNormalizado = normalizar(sp, spMin, spMax);

  return { sp, spMin, spMax, spNormalizado };
}

export function calcularFatorPatologias(
  scoresPatologias: ScorePatologia[],
  maxPatologiasEsperadas: number
): FatorPatologias {
  const fp = scoresPatologias.reduce((acc, sp) => acc + sp.spNormalizado, 0);
  const fpNormalizado = fp / (100 * maxPatologiasEsperadas);
  const alertaExcesso = scoresPatologias.length > maxPatologiasEsperadas;

  return {
    fp,
    fpNormalizado,
    alertaExcesso,
    quantidadePatologias: scoresPatologias.length,
  };
}

export function calcularNotaFinal(
  saNormalizado: number,
  fpNormalizado: number
): number {
  return saNormalizado * (1 + fpNormalizado);
}

export function normalizarNotaFinal(
  nf: number,
  nfMin: number,
  nfMax: number
): number {
  return normalizar(nf, nfMin, nfMax);
}

export function calcularNotaFinalCompleta(
  scoreAtivo: ScoreAtivo,
  scoresPatologias: ScorePatologia[],
  maxPatologiasEsperadas: number
): { notaFinal: number; fatorPatologias: FatorPatologias } {
  const fatorPatologias = calcularFatorPatologias(
    scoresPatologias,
    maxPatologiasEsperadas
  );
  const notaFinal = calcularNotaFinal(
    scoreAtivo.saNormalizado,
    fatorPatologias.fpNormalizado
  );

  return { notaFinal, fatorPatologias };
}

export function gerarFormulaTexto(
  nomeAtivo: string,
  criteriosAtivo: CriterioAtivo[],
  criteriosPatologia: CriterioPatologia[],
  maxPatologiasEsperadas: number
): string {
  const partesAtivo = criteriosAtivo
    .map((c) => `(${((c.peso ?? 0) * 100).toFixed(1)}% × ${c.nome})`)
    .join(" + ");

  const partesPatologia = criteriosPatologia
    .map((c) => `(${((c.peso ?? 0) * 100).toFixed(1)}% × ${c.nome})`)
    .join(" + ");

  return [
    `${nomeAtivo}:`,
    `SA = ${partesAtivo}`,
    `SP = ${partesPatologia}`,
    `FP_norm = Σ SP_k / (100 × ${maxPatologiasEsperadas})`,
    `NF = SA_norm × (1 + FP_norm)`,
  ].join("\n");
}
