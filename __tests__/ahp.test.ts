import { calcularAHP, preencherReciprocas, validarMatriz } from "@/lib/ahp";

describe("calcularAHP", () => {
  test("1 critério retorna peso 1 e RC 0", () => {
    const resultado = calcularAHP([[1]]);
    expect(resultado.pesos).toEqual([1]);
    expect(resultado.razaoConsistencia).toBe(0);
    expect(resultado.valido).toBe(true);
  });

  test("2 critérios com preferência 3:1", () => {
    const matriz = [
      [1, 3],
      [1 / 3, 1],
    ];
    const resultado = calcularAHP(matriz);
    expect(resultado.pesos[0]).toBeCloseTo(0.75, 2);
    expect(resultado.pesos[1]).toBeCloseTo(0.25, 2);
    expect(resultado.razaoConsistencia).toBe(0); // IR[2] = 0
    expect(resultado.valido).toBe(true);
  });

  test("matriz 3x3 consistente", () => {
    // Exemplo clássico: A > B > C
    const matriz = [
      [1, 3, 5],
      [1 / 3, 1, 3],
      [1 / 5, 1 / 3, 1],
    ];
    const resultado = calcularAHP(matriz);
    expect(resultado.pesos.reduce((a, b) => a + b)).toBeCloseTo(1, 5);
    expect(resultado.razaoConsistencia).toBeLessThan(0.1);
    expect(resultado.valido).toBe(true);
  });

  test("matriz inconsistente retorna RC > 0.10", () => {
    // Matriz propositalmente inconsistente
    const matriz = [
      [1, 9, 1 / 9],
      [1 / 9, 1, 9],
      [9, 1 / 9, 1],
    ];
    const resultado = calcularAHP(matriz);
    expect(resultado.razaoConsistencia).toBeGreaterThan(0.1);
    expect(resultado.valido).toBe(false);
  });

  test("soma dos pesos é sempre 1", () => {
    const matrizes = [
      [[1, 2, 3], [1 / 2, 1, 2], [1 / 3, 1 / 2, 1]],
      [[1, 5], [1 / 5, 1]],
      [[1]],
    ];
    for (const m of matrizes) {
      const r = calcularAHP(m);
      expect(r.pesos.reduce((a, b) => a + b)).toBeCloseTo(1, 5);
    }
  });
});

describe("preencherReciprocas", () => {
  test("preenche valor e seu recíproco", () => {
    const matriz = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
    const resultado = preencherReciprocas(matriz, 0, 1, 3);
    expect(resultado[0][1]).toBe(3);
    expect(resultado[1][0]).toBeCloseTo(1 / 3, 9);
    // não altera diagonal
    expect(resultado[0][0]).toBe(1);
  });
});

describe("validarMatriz", () => {
  test("matriz válida é aceita", () => {
    expect(validarMatriz([[1, 1], [1, 1]])).toBe(true); // 1 = recíproco de 1, válido
    expect(validarMatriz([[1]])).toBe(true);
    expect(validarMatriz([[1, 3], [1 / 3, 1]])).toBe(true);
  });

  test("rejeita recíprocos incorretos", () => {
    // matriz[0][1] = 3 mas matriz[1][0] = 3 também (deveria ser 1/3)
    expect(validarMatriz([[1, 3], [3, 1]])).toBe(false);
  });

  test("rejeita dimensões diferentes", () => {
    expect(validarMatriz([[1, 2], [1 / 2, 1], [1, 1]])).toBe(false);
  });
});
