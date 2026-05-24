import { useState } from 'react';
import { X, Plus, Wallet } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';

export default function ModalNovaConta({
  showModal,
  setShowModal,
  adicionarConta
}) {
  const [nome, setNome] = useState('');
  const [saldoInicial, setSaldoInicial] = useState('');

  if (!showModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome) return;
    adicionarConta(nome, saldoInicial);
    setNome('');
    setSaldoInicial('');
    setShowModal(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 animate-in fade-in duration-200"
      onClick={() => setShowModal(false)}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-200"
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
            <Wallet className="mr-2" size={20} />
            Nova Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeConta">Nome da Conta</Label>
              <Input
                id="nomeConta"
                placeholder="Ex: Nubank, Banco do Brasil..."
                value={nome}
                onChange={e => setNome(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="saldoInicial">Saldo Inicial (R$)</Label>
              <Input
                id="saldoInicial"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={saldoInicial}
                onChange={e => setSaldoInicial(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 mt-2 text-white">
              <Plus size={16} className="mr-2" /> Cadastrar Conta
            </Button>
          </form>
        </CardContent>
      </div>
    </div>
  );
}
