import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schemaEscala = z.object({
  rotulo: z.string().min(1),
  valor: z.number(),
});

const schemaCriterio = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional(),
  ordem: z.number().int(),
  escalas: z.array(schemaEscala),
});

const schemaMatriz = z.object({
  tipo: z.enum(["ativo", "patologia"]),
  dadosMatriz: z.array(z.array(z.number())),
  indiceConsistencia: z.number().optional(),
  razaoConsistencia: z.number().optional(),
  valido: z.boolean().optional(),
});

const schemaSalvar = z.object({
  tipoAtivoId: z.string().uuid(),
  notas: z.string().optional(),
  status: z.enum(["rascunho", "ativa"]).default("rascunho"),
  criteriosAtivo: z.array(schemaCriterio),
  criteriosPatologia: z.array(schemaCriterio),
  matrizAtivo: schemaMatriz.optional(),
  matrizPatologia: schemaMatriz.optional(),
  pesosAtivo: z.array(z.number()).optional(),
  pesosPatologia: z.array(z.number()).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parse = schemaSalvar.safeParse(body);

  if (!parse.success) {
    return NextResponse.json({ erro: parse.error.flatten() }, { status: 400 });
  }

  const {
    tipoAtivoId,
    notas,
    status,
    criteriosAtivo,
    criteriosPatologia,
    matrizAtivo,
    matrizPatologia,
    pesosAtivo,
    pesosPatologia,
  } = parse.data;

  // Calcular próximo número de versão
  const ultimaVersao = await prisma.versaoConfiguracao.findFirst({
    where: { tipoAtivoId },
    orderBy: { versao: "desc" },
  });
  const novaVersao = (ultimaVersao?.versao ?? 0) + 1;

  // Se ativando, arquivar versão anterior ativa
  if (status === "ativa" && ultimaVersao) {
    await prisma.versaoConfiguracao.updateMany({
      where: { tipoAtivoId, status: "ativa" },
      data: { status: "arquivada" },
    });
  }

  const versao = await prisma.versaoConfiguracao.create({
    data: {
      tipoAtivoId,
      versao: novaVersao,
      status,
      notas,
      criteriosAtivo: {
        create: criteriosAtivo.map((c, idx) => ({
          nome: c.nome,
          descricao: c.descricao,
          ordem: c.ordem ?? idx,
          peso: pesosAtivo?.[idx] ?? null,
          escalas: { create: c.escalas },
        })),
      },
      criteriosPatologia: {
        create: criteriosPatologia.map((c, idx) => ({
          nome: c.nome,
          descricao: c.descricao,
          ordem: c.ordem ?? idx,
          peso: pesosPatologia?.[idx] ?? null,
          escalas: { create: c.escalas },
        })),
      },
      matrizes: {
        create: [
          ...(matrizAtivo
            ? [
                {
                  tipo: "ativo",
                  dadosMatriz: JSON.stringify(matrizAtivo.dadosMatriz),
                  indiceConsistencia: matrizAtivo.indiceConsistencia ?? null,
                  razaoConsistencia: matrizAtivo.razaoConsistencia ?? null,
                  valido: matrizAtivo.valido ?? false,
                },
              ]
            : []),
          ...(matrizPatologia
            ? [
                {
                  tipo: "patologia",
                  dadosMatriz: JSON.stringify(matrizPatologia.dadosMatriz),
                  indiceConsistencia: matrizPatologia.indiceConsistencia ?? null,
                  razaoConsistencia: matrizPatologia.razaoConsistencia ?? null,
                  valido: matrizPatologia.valido ?? false,
                },
              ]
            : []),
        ],
      },
    },
    include: {
      criteriosAtivo: { include: { escalas: true } },
      criteriosPatologia: { include: { escalas: true } },
      matrizes: true,
    },
  });

  return NextResponse.json(versao, { status: 201 });
}
