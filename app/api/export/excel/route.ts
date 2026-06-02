import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gerarExcel } from "@/lib/export";
import type { CriterioAtivo, CriterioPatologia, MatrizAHP } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tipoAtivoId = searchParams.get("tipoAtivoId");

  if (!tipoAtivoId) {
    return NextResponse.json({ erro: "tipoAtivoId é obrigatório" }, { status: 400 });
  }

  const tipoAtivo = await prisma.tipoAtivo.findUnique({
    where: { id: tipoAtivoId },
    include: {
      versoes: {
        where: { status: "ativa" },
        include: {
          criteriosAtivo: { include: { escalas: true }, orderBy: { ordem: "asc" } },
          criteriosPatologia: { include: { escalas: true }, orderBy: { ordem: "asc" } },
          matrizes: true,
        },
        take: 1,
      },
    },
  });

  if (!tipoAtivo) {
    return NextResponse.json({ erro: "Tipo de ativo não encontrado" }, { status: 404 });
  }

  const versaoAtiva = tipoAtivo.versoes[0];
  if (!versaoAtiva) {
    return NextResponse.json(
      { erro: "Nenhuma versão ativa encontrada. Ative uma versão antes de exportar." },
      { status: 400 }
    );
  }

  const matrizAtivoRaw = versaoAtiva.matrizes.find((m) => m.tipo === "ativo");
  const matrizPatologiaRaw = versaoAtiva.matrizes.find((m) => m.tipo === "patologia");

  const parseMatriz = (m: typeof matrizAtivoRaw): MatrizAHP | undefined => {
    if (!m) return undefined;
    return {
      ...m,
      tipo: m.tipo as "ativo" | "patologia",
      dadosMatriz: JSON.parse(m.dadosMatriz),
    };
  };

  const criteriosAtivo: CriterioAtivo[] = versaoAtiva.criteriosAtivo.map((c) => ({
    ...c,
    escalas: c.escalas,
  }));

  const criteriosPatologia: CriterioPatologia[] = versaoAtiva.criteriosPatologia.map(
    (c) => ({ ...c, escalas: c.escalas })
  );

  const buffer = gerarExcel({
    tipoAtivo: {
      ...tipoAtivo,
      versoes: undefined,
    },
    versao: {
      ...versaoAtiva,
      status: versaoAtiva.status as "rascunho" | "ativa" | "arquivada",
      tipoAtivo: undefined,
      criteriosAtivo: undefined,
      criteriosPatologia: undefined,
      matrizes: undefined,
    },
    criteriosAtivo,
    criteriosPatologia,
    matrizAtivo: parseMatriz(matrizAtivoRaw),
    matrizPatologia: parseMatriz(matrizPatologiaRaw),
  });

  const nomeArquivo = `${tipoAtivo.nome.replace(/\s+/g, "_")}_v${versaoAtiva.versao}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
    },
  });
}
