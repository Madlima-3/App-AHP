import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WizardConfiguracao } from "@/components/WizardConfiguracao";

interface Props {
  params: { id: string };
}

export default async function EditarAtivoPage({ params }: Props) {
  const tipo = await prisma.tipoAtivo.findUnique({
    where: { id: params.id },
  });

  if (!tipo) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nova Versão — {tipo.nome}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure uma nova versão da metodologia AHP
        </p>
      </div>
      <WizardConfiguracao
        tipoAtivoId={params.id}
        estadoBase={{
          identificacao: {
            nome: tipo.nome,
            descricao: tipo.descricao ?? undefined,
            maxPatologiasEsperadas: tipo.maxPatologiasEsperadas,
          },
        }}
      />
    </div>
  );
}
