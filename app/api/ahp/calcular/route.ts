import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calcularAHP } from "@/lib/ahp";

const schema = z.object({
  matriz: z.array(z.array(z.number())).min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parse = schema.safeParse(body);

  if (!parse.success) {
    return NextResponse.json({ erro: parse.error.flatten() }, { status: 400 });
  }

  const n = parse.data.matriz.length;
  for (const row of parse.data.matriz) {
    if (row.length !== n) {
      return NextResponse.json(
        { erro: "Matriz deve ser quadrada NxN" },
        { status: 400 }
      );
    }
  }

  const resultado = calcularAHP(parse.data.matriz);
  return NextResponse.json(resultado);
}
