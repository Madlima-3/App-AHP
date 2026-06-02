import type { ResultadoAHP } from "@/types";

// Índices Randômicos de Saaty (IR) para n = 1..10
const IR: Record<number, number> = {
  1: 0.00,
  2: 0.00,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
};

// Escala Saaty disponível para seleção
export const ESCALA_SAATY = [
  { valor: 9, label: "9", descricao: "Extremamente mais importante" },
  { valor: 8, label: "8", descricao: "Entre muito forte e extremo" },
  { valor: 7, label: "7", descricao: "Muito fortemente mais importante" },
  { valor: 6, label: "6", descricao: "Entre forte e muito forte" },
  { valor: 5, label: "5", descricao: "Fortemente mais importante" },
  { valor: 4, label: "4", descricao: "Entre moderado e forte" },
  { valor: 3, label: "3", descricao: "Moderadamente mais importante" },
  { valor: 2, label: "2", descricao: "Entre igual e moderado" },
  { valor: 1, label: "1", descricao: "Igualmente importante" },
  { valor: 1 / 2, label: "1/2", descricao: "Entre igual e moderado (recíproco)" },
  { valor: 1 / 3, label: "1/3", descricao: "Moderadamente menos importante" },
  { valor: 1 / 4, label: "1/4", descricao: "Entre moderado e forte (recíproco)" },
  { valor: 1 / 5, label: "1/5", descricao: "Fortemente menos importante" },
  { valor: 1 / 6, label: "1/6", descricao: "Entre forte e muito forte (recíproco)" },
  { valor: 1 / 7, label: "1/7", descricao: "Muito fortemente menos importante" },
  { valor: 1 / 8, label: "1/8", descricao: "Entre muito forte e extremo (recíproco)" },
  { valor: 1 / 9, label: "1/9", descricao: "Extremamente menos importante" },
];

export function criarMatrizIdentidade(n: number): number[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
}

export function calcularAHP(matriz: number[][]): ResultadoAHP {
  const n = matriz.length;

  if (n < 1) throw new Error("Matriz deve ter pelo menos 1 critério");

  if (n === 1) {
    return {
      pesos: [1],
      lambdaMax: 1,
      indiceConsistencia: 0,
      razaoConsistencia: 0,
      valido: true,
    };
  }

  // Passo 1: soma de cada coluna
  const somasColunas = Array.from({ length: n }, (_, j) =>
    matriz.reduce((acc, row) => acc + row[j], 0)
  );

  // Passo 2: normalizar colunas e calcular vetor de prioridades
  const matrizNormalizada = matriz.map((row) =>
    row.map((val, j) => val / somasColunas[j])
  );

  const pesos = matrizNormalizada.map(
    (row) => row.reduce((acc, val) => acc + val, 0) / n
  );

  // Passo 3: lambda max — (A × w) / w por elemento, depois média
  const Aw = Array.from({ length: n }, (_, i) =>
    matriz[i].reduce((acc, val, j) => acc + val * pesos[j], 0)
  );

  const vetorConsistencia = Aw.map((val, i) => val / pesos[i]);
  const lambdaMax = vetorConsistencia.reduce((acc, v) => acc + v, 0) / n;

  // Passo 4: IC
  const ic = (lambdaMax - n) / (n - 1);

  // Passo 5: RC
  const ir = IR[n] ?? 1.49;
  const rc = ir === 0 ? 0 : ic / ir;

  // Passo 6: validade
  const valido = rc <= 0.10;

  return {
    pesos,
    lambdaMax,
    indiceConsistencia: ic,
    razaoConsistencia: rc,
    valido,
  };
}

export function preencherReciprocas(
  matriz: number[][],
  i: number,
  j: number,
  valor: number
): number[][] {
  const nova = matriz.map((row) => [...row]);
  nova[i][j] = valor;
  nova[j][i] = 1 / valor;
  return nova;
}

export function validarMatriz(matriz: number[][]): boolean {
  const n = matriz.length;
  for (let i = 0; i < n; i++) {
    if (matriz[i].length !== n) return false;
    for (let j = 0; j < n; j++) {
      if (i === j && matriz[i][j] !== 1) return false;
      if (i !== j && matriz[i][j] <= 0) return false;
      if (Math.abs(matriz[i][j] * matriz[j][i] - 1) > 1e-9) return false;
    }
  }
  return true;
}
