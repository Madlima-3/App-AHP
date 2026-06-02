import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schemaCriar = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional(),
  maxPatologiasEsperadas: z.number().int().positive().default(3),
});

export async function GET() {
  const tipos = await prisma.tipoAtivo.findMany({
    orderBy: { criadoEm: "desc" },
    include: {
      versoes: {
        orderBy: { versao: "desc" },
        take: 1,
      },
    },
  });
  return NextResponse.json(tipos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parse = schemaCriar.safeParse(body);

  if (!parse.success) {
    return NextResponse.json({ erro: parse.error.flatten() }, { status: 400 });
  }

  const { nome, descricao, maxPatologiasEsperadas } = parse.data;

  const tipoAtivo = await prisma.tipoAtivo.create({
    data: { nome, descricao, maxPatologiasEsperadas },
  });

  return NextResponse.json(tipoAtivo, { status: 201 });
}
