import { useState } from 'react';
import { X, Plus, PieChart } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';

export default function ModalNovoOrcamento({
  showModal,
  setShowModal,
  salvarOrcamento
}) {
  const [novaCategoria, setNovaCategoria] = useState('');
  const [novoLimite, setNovoLimite] = useState('');

  if (!showModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!novaCategoria || !novoLimite) return;
    salvarOrcamento(novaCategoria, novoLimite);
    setNovaCategoria('');
    setNovoLimite('');
    setShowModal(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 animate-in fade-in duration-200"
      onClick={() => setShowModal(false)}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-slate-500 hover:text-slate-700"
          onClick={() => setShowModal(false)}
          aria-label="Fechar modal"
        >
          <X size={20} />
        </button>
        <CardHeader className="bg-slate-50 border-b border-slate-100 -mx-6 -mt-6 mb-4 px-6 py-4 rounded-t-lg">
          <CardTitle className="text-lg text-slate-700 flex items-center">
            <PieChart className="mr-2" size={20} />
            Nova Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="catOrcamento">Categoria</Label>
              <Input
                id="catOrcamento"
                placeholder="Ex: Alimentação, Lazer..."
                value={novaCategoria}
                onChange={e => setNovaCategoria(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="limiteOrcamento">Limite Mensal (R$)</Label>
              <Input
                id="limiteOrcamento"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={novoLimite}
                onChange={e => setNovoLimite(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 mt-2 text-white">
              <Plus size={16} className="mr-2" /> Salvar Orçamento
            </Button>
          </form>
        </CardContent>
      </div>
    </div>
  );
}
