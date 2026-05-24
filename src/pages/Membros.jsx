import React from 'react';
import { UserPlus, Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export default function Membros({ 
  membros, 
  novoMembro, 
  setNovoMembro, 
  adicionarMembro, 
  removerMembro, 
  setMembroSelecionado, 
  setAbaAtiva 
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-lg text-slate-700 flex items-center">
            <UserPlus className="mr-2" size={20} />
            Adicionar Novo Membro
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={adicionarMembro} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input 
                id="nome" 
                placeholder="Ex: Ana" 
                value={novoMembro.nome}
                onChange={e => setNovoMembro({...novoMembro, nome: e.target.value})}
              />
            </div>
            <div className="w-full space-y-2">
              <Label htmlFor="papel">Papel na Família (opcional)</Label>
              <Input 
                id="papel" 
                placeholder="Ex: Filha" 
                value={novoMembro.papel}
                onChange={e => setNovoMembro({...novoMembro, papel: e.target.value})}
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
              <Plus size={16} className="mr-2" /> Adicionar
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {membros.map(membro => (
          <Card 
            key={membro.id} 
            className="shadow-sm border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer group" 
            onClick={() => { setMembroSelecionado(membro.id); setAbaAtiva('metas'); }}
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                  {membro.nome.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{membro.nome}</h3>
                  {membro.papel && <p className="text-sm text-slate-500">{membro.papel}</p>}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-300 hover:text-red-500 hover:bg-red-50" 
                onClick={(e) => { e.stopPropagation(); removerMembro(membro.id); }}
              >
                <Trash2 size={18} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
