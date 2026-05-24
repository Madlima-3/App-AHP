
import { Users, Trophy, Target, Wallet, Activity, Heart, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PILARES } from '../constants';

export default function Dashboard({ metas, membros, financas, alternarMetaStatus, setAbaAtiva }) {
  const metasPendentes = metas.filter(m => !m.concluida).length;
  const metasConcluidas = metas.filter(m => m.concluida).length;
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-white shadow-sm border-indigo-100">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Membros</p>
              <h3 className="text-2xl font-bold text-slate-800">{membros.length}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-white shadow-sm border-emerald-100">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Metas Ok</p>
              <h3 className="text-2xl font-bold text-slate-800">{metasConcluidas}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white shadow-sm border-amber-100">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-amber-100 rounded-full text-amber-600">
              <Target size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Andamento</p>
              <h3 className="text-2xl font-bold text-slate-800">{metasPendentes}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Mini resumo financeiro no dashboard */}
        <Card className="bg-gradient-to-br from-teal-50 to-white shadow-sm border-teal-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setAbaAtiva('financas')}>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-teal-100 rounded-full text-teal-600">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Saldo Familiar</p>
              <h3 className={`text-xl font-bold ${financas.saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                R$ {financas.saldo.toFixed(2)}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-lg flex items-center text-slate-700">
              <Activity className="mr-2" size={20} />
              Atividade Recente da Família
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {metas.slice(0, 5).map(meta => {
                const membro = meta.membroId === 'familia' ? { nome: 'Toda a Família' } : membros.find(m => String(m.id) === String(meta.membroId));
                const pilar = PILARES.find(p => p.id === meta.pilar);
                
                return (
                  <div key={meta.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-3">
                       <div className={`p-2 rounded-full ${pilar?.color}`}>
                         {pilar && <pilar.icon size={16} />}
                       </div>
                       <div>
                         <p className={`font-medium ${meta.concluida ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                           {meta.titulo}
                         </p>
                         <p className="text-xs text-slate-500">Para: {membro?.nome || 'Desconhecido'}</p>
                       </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => alternarMetaStatus(meta.id)}
                      className={meta.concluida ? 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}
                    >
                      <CheckCircle size={20} className={meta.concluida ? "fill-emerald-100" : ""} />
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-lg flex items-center text-slate-700">
              <Heart className="mr-2" size={20} />
              Nossos Pilares
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {PILARES.map(pilar => {
                const contagem = metas.filter(m => m.pilar === pilar.id).length;
                return (
                  <div key={pilar.id} className={`p-4 rounded-xl border ${pilar.color.replace('text-', 'border-').replace('bg-', 'bg-opacity-20 bg-')} flex flex-col items-center text-center`}>
                    <pilar.icon size={24} className={`mb-2 ${pilar.color.split(' ')[1]}`} />
                    <h4 className="font-semibold text-slate-700 text-sm">{pilar.nome}</h4>
                    <p className="text-xs font-medium mt-1">{contagem} metas</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
