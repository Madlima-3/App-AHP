import { WizardConfiguracao } from "@/components/WizardConfiguracao";

export default function NovaTipoAtivoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Novo Tipo de Ativo</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure a metodologia AHP em 6 etapas
        </p>
      </div>
      <WizardConfiguracao />
    </div>
  );
}
