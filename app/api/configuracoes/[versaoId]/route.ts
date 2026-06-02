import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schemaAtualizar = z.object({
  status: z.enum(["rascunho", "ativa", "arquivada"]).optional(),
  notas: z.string().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { versaoId: string } }
) {
  const versao = await prisma.versaoConfiguracao.findUnique({
    where: { id: params.versaoId },
    include: {
      tipoAtivo: true,
      criteriosAtivo: { include: { escalas: true }, orderBy: { ordem: "asc" } },
      criteriosPatologia: { include: { escalas: true }, orderBy: { ordem: "asc" } },
      matrizes: true,
    },
  });

  if (!versao) {
    return NextResponse.json({ erro: "Versão não encontrada" }, { status: 404 });
  }

  const versaoFormatada = {
    ...versao,
    matrizes: versao.matrizes.map((m) => ({
      ...m,
      dadosMatriz: JSON.parse(m.dadosMatriz),
    })),
  };

  return NextResponse.json(versaoFormatada);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { versaoId: string } }
) {
  const body = await req.json();
  const parse = schemaAtualizar.safeParse(body);

  if (!parse.success) {
    return NextResponse.json({ erro: parse.error.flatten() }, { status: 400 });
  }

  const versaoAtual = await prisma.versaoConfiguracao.findUnique({
    where: { id: params.versaoId },
  });

  if (!versaoAtual) {
    return NextResponse.json({ erro: "Versão não encontrada" }, { status: 404 });
  }

  // Se ativando, arquivar versão ativa anterior
  if (parse.data.status === "ativa") {
    await prisma.versaoConfiguracao.updateMany({
      where: { tipoAtivoId: versaoAtual.tipoAtivoId, status: "ativa" },
      data: { status: "arquivada" },
    });
  }

  const versao = await prisma.versaoConfiguracao.update({
    where: { id: params.versaoId },
    data: parse.data,
  });

  return NextResponse.json(versao);
}
