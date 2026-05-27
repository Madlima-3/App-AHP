
import { Users, Trophy, Target, Wallet, Activity, Heart, CheckCircle, Repeat, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PILARES } from '../constants';

const TODAY = new Date().toISOString().split('T')[0];

function getWeekDates() {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

function frequenciaCount(historico = [], periodo) {
  if (periodo === 'diario') return historico.filter(e => e.data === TODAY).length;
  if (periodo === 'mensal') return historico.filter(e => e.data.startsWith(TODAY.slice(0, 7))).length;
  const weekDates = getWeekDates();
  return historico.filter(e => weekDates.includes(e.data)).length;
}

export default function Dashboard({ metas, membros, financas, alternarMetaStatus, adicionarCheckin, removerCheckin, setAbaAtiva }) {
  const metasPendentes = metas.filter(m => (m.tipo || 'marco') === 'marco' && !m.concluida).length;
  const metasConcluidas = metas.filter(m => (m.tipo || 'marco') === 'marco' && m.concluida).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-vblue-50 to-white shadow-sm border-vblue-100 min-h-[110px]">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-vblue-100 rounded-full text-vblue">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Membros</p>
                <h3 className="text-2xl font-bold text-slate-800">{membros.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-vpink-50 to-white shadow-sm border-vpink-100 min-h-[110px]">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-vpink-100 rounded-full text-vpink-700">
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Metas Ok</p>
                <h3 className="text-2xl font-bold text-slate-800">{metasConcluidas}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-vyellow-50 to-white shadow-sm border-vyellow-100 min-h-[110px]">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-vyellow-100 rounded-full text-vyellow-800">
                <Target size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Andamento</p>
                <h3 className="text-2xl font-bold text-slate-800">{metasPendentes}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-vblue-50 to-white shadow-sm border-vblue-100 cursor-pointer hover:shadow-md transition-shadow min-h-[110px]" onClick={() => setAbaAtiva('financas')}>
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-vblue-100 rounded-full text-vblue">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Saldo Familiar</p>
                <h3 className={`text-xl font-bold ${financas.saldo >= 0 ? 'text-vblue' : 'text-vcoral'}`}>
                  R$ {financas.saldo.toFixed(2)}
                </h3>
              </div>
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
                const tipo = meta.tipo || 'marco';
                const historico = meta.historico || [];
                const fezHoje = historico.some(e => e.data === TODAY);
                const todayEntry = historico.find(e => e.data === TODAY);

                const isFeito = tipo === 'marco' ? meta.concluida : tipo === 'habito' ? fezHoje : false;
                const lineThrough = (tipo === 'marco' && meta.concluida) || (tipo === 'habito' && fezHoje);

                const handleCheck = () => {
                  if (tipo === 'marco') {
                    alternarMetaStatus(meta.id);
                  } else if (tipo === 'habito') {
                    fezHoje && todayEntry
                      ? removerCheckin(meta.id, todayEntry)
                      : adicionarCheckin(meta.id, 1, TODAY);
                  } else if (tipo === 'frequencia') {
                    fezHoje && todayEntry
                      ? removerCheckin(meta.id, todayEntry)
                      : adicionarCheckin(meta.id, 1, TODAY);
                  }
                };

                const showButton = tipo !== 'quantitativo';
                const count = tipo === 'frequencia' ? frequenciaCount(historico, meta.periodo) : null;
                const periodoLabel = { diario: 'hoje', semanal: '/sem', mensal: '/mês' }[meta.periodo] || '/sem';

                return (
                  <div key={meta.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${pilar?.color}`}>
                        {pilar && <pilar.icon size={16} />}
                      </div>
                      <div>
                        <p className={`font-medium ${lineThrough ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {meta.titulo}
                        </p>
                        <p className="text-xs text-slate-500">Para: {membro?.nome || 'Desconhecido'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {tipo === 'frequencia' && (
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Repeat size={11} />{count}/{meta.alvo || '?'}{periodoLabel}
                        </span>
                      )}
                      {tipo === 'quantitativo' && (() => {
                        const total = historico.filter(e => {
                          if (meta.periodo === 'diario') return e.data === TODAY;
                          if (meta.periodo === 'mensal') return e.data.startsWith(TODAY.slice(0, 7));
                          return getWeekDates().includes(e.data);
                        }).reduce((s, e) => s + (e.valor || 0), 0);
                        const pLabel = { diario: 'hoje', semanal: '/sem', mensal: '/mês' }[meta.periodo] || '/sem';
                        return (
                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <TrendingUp size={11} />{Number.isInteger(total) ? total : total.toFixed(1)}/{meta.alvo || '?'} {meta.unidade || ''}{pLabel}
                          </span>
                        );
                      })()}
                      {showButton && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCheck}
                          title={fezHoje && tipo !== 'marco' ? 'Clique para cancelar' : undefined}
                          className={isFeito || (tipo === 'frequencia' && fezHoje)
                            ? 'text-vblue hover:text-vcoral hover:bg-vcoral-50'
                            : 'text-slate-400 hover:text-vblue hover:bg-vblue-50'
                          }
                        >
                          <CheckCircle size={20} className={isFeito || (tipo === 'frequencia' && fezHoje) ? 'fill-vblue-100' : ''} />
                        </Button>
                      )}
                    </div>
                  </div>
                );
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
                  <div key={pilar.id} className={`p-4 rounded-xl border ${pilar.color} ${pilar.borderColor} flex flex-col items-center text-center`}>
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
