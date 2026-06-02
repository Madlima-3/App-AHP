import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schemaAtualizar = z.object({
  nome: z.string().min(1).optional(),
  descricao: z.string().optional(),
  maxPatologiasEsperadas: z.number().int().positive().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const tipo = await prisma.tipoAtivo.findUnique({
    where: { id: params.id },
    include: {
      versoes: {
        orderBy: { versao: "desc" },
        include: {
          criteriosAtivo: { include: { escalas: true }, orderBy: { ordem: "asc" } },
          criteriosPatologia: { include: { escalas: true }, orderBy: { ordem: "asc" } },
          matrizes: true,
        },
      },
    },
  });

  if (!tipo) {
    return NextResponse.json({ erro: "Tipo de ativo não encontrado" }, { status: 404 });
  }

  return NextResponse.json(tipo);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const parse = schemaAtualizar.safeParse(body);

  if (!parse.success) {
    return NextResponse.json({ erro: parse.error.flatten() }, { status: 400 });
  }

  const tipo = await prisma.tipoAtivo.update({
    where: { id: params.id },
    data: parse.data,
  });

  return NextResponse.json(tipo);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.tipoAtivo.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
