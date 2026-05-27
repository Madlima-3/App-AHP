
import { X, Plus } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';

export default function ModalNovaTransacao({
  showModal,
  setShowModal,
  novaTransacao,
  setNovaTransacao,
  adicionarTransacao,
  orcamentos,
  contas
}) {
  if (!showModal) return null;

  const handleSubmit = (e) => {
    adicionarTransacao(e);
    setShowModal(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={() => setShowModal(false)}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-slate-500 hover:text-slate-700"
          onClick={() => setShowModal(false)}
          aria-label="Fechar modal"
        >
          <X size={20} />
        </button>
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-lg text-slate-700 flex items-center">
            <Plus className="mr-2" size={20} />
            Novo Lançamento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={novaTransacao.tipo === 'despesa' ? 'default' : 'outline'}
                className={`flex-1 ${novaTransacao.tipo === 'despesa' ? 'bg-vcoral hover:bg-vcoral-700 text-white' : ''}`}
                onClick={() => setNovaTransacao({ ...novaTransacao, tipo: 'despesa' })}
              >
                Despesa
              </Button>
              <Button
                type="button"
                variant={novaTransacao.tipo === 'receita' ? 'default' : 'outline'}
                className={`flex-1 ${novaTransacao.tipo === 'receita' ? 'bg-vblue hover:bg-vblue-700 text-white' : ''}`}
                onClick={() => setNovaTransacao({ ...novaTransacao, tipo: 'receita' })}
              >
                Receita
              </Button>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="statusTransacao">Status do Lançamento</Label>
              <div id="statusTransacao" className="flex gap-2">
                <Button
                  type="button"
                  variant={novaTransacao.efetuado ? 'default' : 'outline'}
                  className={`flex-1 text-xs ${novaTransacao.efetuado ? 'bg-vblue hover:bg-vblue-700 text-white' : ''}`}
                  onClick={() => setNovaTransacao({ ...novaTransacao, efetuado: true })}
                >
                  Efetivado (Pago/Rec.)
                </Button>
                <Button
                  type="button"
                  variant={!novaTransacao.efetuado ? 'default' : 'outline'}
                  className={`flex-1 text-xs ${!novaTransacao.efetuado ? 'bg-vyellow hover:bg-vyellow text-slate-800' : ''}`}
                  onClick={() => setNovaTransacao({ ...novaTransacao, efetuado: false })}
                >
                  Pendente (Agendado)
                </Button>
              </div>
            </div>

            {/* Conta */}
            <div className="space-y-2">
              <Label htmlFor="contaTransacao">Conta</Label>
              <select
                id="contaTransacao"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vblue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={novaTransacao.contaId || ''}
                onChange={e => setNovaTransacao({ ...novaTransacao, contaId: e.target.value })}
                required
              >
                <option value="" disabled>Selecione uma conta...</option>
                {contas && contas.map(conta => (
                  <option key={conta.id} value={conta.id}>{conta.nome}</option>
                ))}
              </select>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descTransacao">Descrição</Label>
              <Input
                id="descTransacao"
                placeholder="Ex: Supermercado"
                value={novaTransacao.descricao}
                onChange={e => setNovaTransacao({ ...novaTransacao, descricao: e.target.value })}
              />
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="valorTransacao">
                {novaTransacao.repeticao === 'parcelada' ? 'Valor Total da Compra (R$)' : 'Valor (R$)'}
              </Label>
              <Input
                id="valorTransacao"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={novaTransacao.valor}
                onChange={e => setNovaTransacao({ ...novaTransacao, valor: e.target.value })}
              />
            </div>

            {/* Repetição */}
            <div className="space-y-2">
              <Label htmlFor="repeticaoTransacao">Repetição</Label>
              <div id="repeticaoTransacao" className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={(novaTransacao.repeticao || 'unica') === 'unica' ? 'default' : 'outline'}
                  className={`text-xs ${(novaTransacao.repeticao || 'unica') === 'unica' ? 'bg-vblue-800 text-white hover:bg-vblue-700' : ''}`}
                  onClick={() => setNovaTransacao({ ...novaTransacao, repeticao: 'unica', quantidadeMeses: '' })}
                >
                  Única
                </Button>
                <Button
                  type="button"
                  variant={novaTransacao.repeticao === 'parcelada' ? 'default' : 'outline'}
                  className={`text-xs ${novaTransacao.repeticao === 'parcelada' ? 'bg-vblue-800 text-white hover:bg-vblue-700' : ''}`}
                  onClick={() => setNovaTransacao({ ...novaTransacao, repeticao: 'parcelada', quantidadeMeses: '2' })}
                >
                  Parcelada
                </Button>
                <Button
                  type="button"
                  variant={novaTransacao.repeticao === 'fixa' ? 'default' : 'outline'}
                  className={`text-xs ${novaTransacao.repeticao === 'fixa' ? 'bg-vblue-800 text-white hover:bg-vblue-700' : ''}`}
                  onClick={() => setNovaTransacao({ ...novaTransacao, repeticao: 'fixa', quantidadeMeses: '12' })}
                >
                  Fixa
                </Button>
              </div>
            </div>

            {/* Quantidade meses */}
            {novaTransacao.repeticao !== 'unica' && novaTransacao.repeticao !== undefined && (
              <div className="space-y-2">
                <Label htmlFor="qtdMeses">
                  {novaTransacao.repeticao === 'parcelada' ? 'Número de Parcelas' : 'Repetir por Quantos Meses?'}
                </Label>
                <Input
                  id="qtdMeses"
                  type="number"
                  min="2"
                  max="120"
                  value={novaTransacao.quantidadeMeses}
                  onChange={e => setNovaTransacao({ ...novaTransacao, quantidadeMeses: e.target.value })}
                />
                {novaTransacao.repeticao === 'parcelada' && novaTransacao.quantidadeMeses && novaTransacao.valor && (
                  <p className="text-xs text-slate-500 text-right mt-1">
                    Serão {novaTransacao.quantidadeMeses} parcelas de R${(Number(novaTransacao.valor) / Number(novaTransacao.quantidadeMeses)).toFixed(2)}
                  </p>
                )}
              </div>
            )}

            {/* Categoria & Data */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="catTransacao">Categoria</Label>
                <select
                  id="catTransacao"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vblue"
                  value={novaTransacao.categoria}
                  onChange={e => setNovaTransacao({ ...novaTransacao, categoria: e.target.value })}
                >
                  <option value="Sem categoria">Sem categoria</option>
                  {orcamentos.map(orc => (
                    <option key={orc.categoria} value={orc.categoria}>{orc.categoria}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataTransacao">Data</Label>
                <Input
                  id="dataTransacao"
                  type="date"
                  value={novaTransacao.data}
                  onChange={e => setNovaTransacao({ ...novaTransacao, data: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-vblue hover:bg-vblue-700 text-white mt-2">
              Registrar {novaTransacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
            </Button>
          </form>
        </CardContent>
      </div>
    </div>
  );
}
