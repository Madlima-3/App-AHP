
import { Target, Plus, Trash2, UserPlus, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { PILARES } from '../constants';

export default function Metas({ 
  metas, 
  membros, 
  novaMeta, 
  setNovaMeta, 
  adicionarMeta, 
  alternarMetaStatus, 
  removerMeta, 
  membroSelecionado, 
  setMembroSelecionado 
}) {
  const metasFiltradas = membroSelecionado && membroSelecionado !== 'todos'
    ? metas.filter(m => String(m.membroId) === String(membroSelecionado) || m.membroId === 'familia')
    : metas;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-lg text-slate-700 flex items-center">
            <Target className="mr-2" size={20} />
            Nova Meta / Ação
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={adicionarMeta} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tituloMeta">Título</Label>
                <Input 
                  id="tituloMeta" 
                  placeholder="O que precisa ser feito?" 
                  value={novaMeta.titulo}
                  onChange={e => setNovaMeta({...novaMeta, titulo: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="membroMeta">Para quem?</Label>
                <select 
                  id="membroMeta"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={novaMeta.membroId}
                  onChange={e => setNovaMeta({...novaMeta, membroId: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  <option value="familia">Toda a Família</option>
                  {membros.map(m => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descMeta">Descrição / Detalhes</Label>
              <Input 
                id="descMeta" 
                placeholder="Como isso será realizado?" 
                value={novaMeta.descricao}
                onChange={e => setNovaMeta({...novaMeta, descricao: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pilarMeta">Pilar</Label>
                <select 
                  id="pilarMeta"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={novaMeta.pilar}
                  onChange={e => setNovaMeta({...novaMeta, pilar: e.target.value})}
                >
                  {PILARES.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prazoMeta">Prazo (opcional)</Label>
                <Input 
                  id="prazoMeta" 
                  type="date"
                  value={novaMeta.prazo}
                  onChange={e => setNovaMeta({...novaMeta, prazo: e.target.value})}
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2">
              <Plus size={16} className="mr-2" /> Criar Meta
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 mb-4">
        <h3 className="text-xl font-bold text-slate-800">Metas Atuais</h3>
        <select 
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          value={membroSelecionado || 'todos'}
          onChange={e => setMembroSelecionado(e.target.value === 'todos' ? null : e.target.value)}
        >
          <option value="todos">Filtrar: Todos os Membros</option>
          <option value="familia">Projetos em Família</option>
          {membros.map(m => (
            <option key={m.id} value={m.id}>{m.nome}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {metasFiltradas.map(meta => {
          const membro = meta.membroId === 'familia' ? { nome: 'Toda a Família' } : membros.find(m => String(m.id) === String(meta.membroId));
          const pilar = PILARES.find(p => p.id === meta.pilar);
          
          return (
            <Card key={meta.id} className={`shadow-sm border transition-all ${meta.concluida ? 'bg-slate-50 border-slate-200 opacity-75' : 'border-slate-200 hover:shadow-md'}`}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className={`px-2 py-1 rounded text-xs font-semibold flex items-center space-x-1 ${pilar?.color}`}>
                    {pilar && <pilar.icon size={12} />}
                    <span>{pilar?.nome}</span>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-500" onClick={() => removerMeta(meta.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                
                <h4 className={`font-bold text-lg mb-1 ${meta.concluida ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                  {meta.titulo}
                </h4>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[40px]">
                  {meta.descricao || 'Sem descrição'}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500 flex flex-col space-y-1">
                    <span className="flex items-center"><UserPlus size={12} className="mr-1"/> {membro?.nome || 'Desconhecido'}</span>
                    {meta.prazo && <span className="flex items-center"><Calendar size={12} className="mr-1"/> {new Date(meta.prazo).toLocaleDateString()}</span>}
                  </div>
                  
                  <Button 
                    variant={meta.concluida ? "outline" : "default"} 
                    size="sm"
                    className={meta.concluida ? 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100' : 'bg-indigo-600 hover:bg-indigo-700'}
                    onClick={() => alternarMetaStatus(meta.id)}
                  >
                    {meta.concluida ? (
                      <><CheckCircle size={16} className="mr-2" /> Concluído</>
                    ) : (
                      'Marcar Feito'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
