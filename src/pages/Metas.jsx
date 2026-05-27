
import { useState } from 'react';
import { Target, Plus, Trash2, UserPlus, Calendar, CheckCircle, CheckSquare, CalendarCheck, Repeat, TrendingUp, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { PILARES, TIPOS_META } from '../constants';

// Returns ISO date strings Mon–Sun for the current week
function getWeekDates() {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

function calcFrequenciaProgress(historico = [], alvo, periodo) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  let filtered;
  if (periodo === 'diario') {
    filtered = historico.filter(e => e.data === todayStr);
  } else if (periodo === 'mensal') {
    const prefix = todayStr.slice(0, 7);
    filtered = historico.filter(e => e.data.startsWith(prefix));
  } else {
    const weekDates = getWeekDates();
    filtered = historico.filter(e => weekDates.includes(e.data));
  }
  const count = filtered.length;
  return { count, alvo: alvo || 0, pct: alvo ? Math.min(100, (count / alvo) * 100) : 0 };
}

function calcQuantitativoProgress(historico = [], alvo, periodo) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  let filtered;
  if (periodo === 'diario') {
    filtered = historico.filter(e => e.data === todayStr);
  } else if (periodo === 'semanal') {
    const weekDates = getWeekDates();
    filtered = historico.filter(e => weekDates.includes(e.data));
  } else {
    const prefix = todayStr.slice(0, 7);
    filtered = historico.filter(e => e.data.startsWith(prefix));
  }
  const total = filtered.reduce((s, e) => s + (e.valor || 0), 0);
  return { total, alvo: alvo || 0, pct: alvo ? Math.min(100, (total / alvo) * 100) : 0 };
}

function HabitoWeekGrid({ meta, adicionarCheckin, removerCheckin }) {
  const weekDates = getWeekDates();
  const labels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  const historico = meta.historico || [];
  return (
    <div className="flex gap-1 justify-center mt-3">
      {weekDates.map((dateStr, i) => {
        const entry = historico.find(e => e.data === dateStr);
        const checked = !!entry;
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        return (
          <button
            key={dateStr}
            onClick={() => checked
              ? removerCheckin(meta.id, entry)
              : adicionarCheckin(meta.id, 1, dateStr)
            }
            title={dateStr}
            className={`w-8 h-8 rounded-full text-xs font-semibold border transition-colors
              ${isToday ? 'ring-2 ring-vblue ring-offset-1' : ''}
              ${checked
                ? 'bg-vblue text-white border-vblue'
                : 'bg-white text-slate-500 border-slate-200 hover:border-vblue'
              }`}
          >
            {labels[i]}
          </button>
        );
      })}
    </div>
  );
}

function FrequenciaCounter({ meta, adicionarCheckin, removerCheckin }) {
  const periodo = meta.periodo || 'semanal';
  const { count, alvo, pct } = calcFrequenciaProgress(meta.historico, meta.alvo, periodo);
  const todayStr = new Date().toISOString().split('T')[0];
  const historico = meta.historico || [];
  const todayEntry = historico.find(e => e.data === todayStr);
  const jaFezHoje = !!todayEntry;
  const periodoLabel = { diario: 'hoje', semanal: 'esta semana', mensal: 'este mês' }[periodo] || '';

  const handleClick = () => {
    if (jaFezHoje) removerCheckin(meta.id, todayEntry);
    else adicionarCheckin(meta.id);
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{periodoLabel}</span>
        <span className="font-semibold text-slate-700">{count}/{alvo}x</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className="bg-vblue h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <Button
        onClick={handleClick}
        size="sm"
        className={`w-full text-xs transition-colors ${
          jaFezHoje
            ? 'bg-vblue-50 text-vblue border border-vblue-100 hover:bg-vcoral-50 hover:text-vcoral hover:border-vcoral-100'
            : 'bg-vblue hover:bg-vblue-700 text-white'
        }`}
      >
        {jaFezHoje ? 'Feito hoje ✓  —  clique para cancelar' : '+1 hoje'}
      </Button>
    </div>
  );
}

function QuantitativoProgress({ meta, adicionarCheckin, removerCheckin }) {
  const [input, setInput] = useState('');
  const [showHistorico, setShowHistorico] = useState(false);

  const periodo = meta.periodo || 'semanal';
  const { total, alvo, pct } = calcQuantitativoProgress(meta.historico, meta.alvo, periodo);
  const periodoLabel = { diario: 'hoje', semanal: 'esta semana', mensal: 'este mês' }[periodo] || '';
  const metaCumprida = alvo > 0 && pct >= 100;

  const todayStr = new Date().toISOString().split('T')[0];
  const historico = meta.historico || [];
  const periodoEntries = [...(periodo === 'diario'
    ? historico.filter(e => e.data === todayStr)
    : periodo === 'mensal'
      ? historico.filter(e => e.data.startsWith(todayStr.slice(0, 7)))
      : historico.filter(e => getWeekDates().includes(e.data))
  )].sort((a, b) => (b.ts || 0) - (a.ts || 0));

  const handleAdd = () => {
    const v = parseFloat(input);
    if (!v || v <= 0) return;
    adicionarCheckin(meta.id, v);
    setInput('');
  };

  const fmtVal = v => Number.isInteger(v) ? v : parseFloat(v.toFixed(2));

  return (
    <div className="mt-3 space-y-2">
      {metaCumprida && (
        <div className="flex items-center justify-center gap-2 bg-vblue-50 border border-vblue-100 rounded-lg py-2 text-vblue font-semibold text-xs">
          <CheckCircle size={14} className="fill-vblue-100" /> Meta atingida!
        </div>
      )}
      <div className="flex justify-between text-xs text-slate-500">
        <span>{periodoLabel}</span>
        <span className={`font-semibold ${metaCumprida ? 'text-vblue' : 'text-slate-700'}`}>
          {fmtVal(total)}/{alvo} {meta.unidade || ''}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${metaCumprida ? 'bg-vblue' : 'bg-vyellow-700'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex gap-2">
        <Input
          type="number"
          min="0"
          step="0.1"
          placeholder={`+ ${meta.unidade || 'valor'}`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="h-8 text-xs"
        />
        <Button
          onClick={handleAdd}
          size="sm"
          className="bg-vyellow-700 hover:bg-vyellow-800 text-white text-xs px-3 h-8 shrink-0"
        >
          OK
        </Button>
      </div>
      {periodoEntries.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowHistorico(h => !h)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showHistorico ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {periodoEntries.length} lançamento{periodoEntries.length > 1 ? 's' : ''} {periodoLabel}
          </button>
          {showHistorico && (
            <div className="mt-1 space-y-1 max-h-36 overflow-y-auto">
              {periodoEntries.map(entry => (
                <div key={entry.ts} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded px-2 py-1 text-xs">
                  <span className="text-slate-600">{entry.data} — <span className="font-medium">{fmtVal(entry.valor)} {meta.unidade || ''}</span></span>
                  <button
                    onClick={() => removerCheckin(meta.id, entry)}
                    className="text-slate-300 hover:text-vcoral transition-colors ml-2"
                    title="Remover lançamento"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const TIPO_ICONS = {
  marco: CheckSquare,
  habito: CalendarCheck,
  frequencia: Repeat,
  quantitativo: TrendingUp,
};

export default function Metas({
  metas,
  membros,
  novaMeta,
  setNovaMeta,
  adicionarMeta,
  alternarMetaStatus,
  removerMeta,
  adicionarCheckin,
  removerCheckin,
  membroSelecionado,
  setMembroSelecionado
}) {
  const metasFiltradas = membroSelecionado && membroSelecionado !== 'todos'
    ? metas.filter(m => String(m.membroId) === String(membroSelecionado) || m.membroId === 'familia')
    : metas;

  const tipo = novaMeta.tipo || 'marco';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-lg text-slate-700 flex items-center">
            <Target className="mr-2" size={20} />
            Nova Meta
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={adicionarMeta} className="space-y-4">

            {/* Tipo selector */}
            <div className="space-y-2">
              <Label>Tipo de Meta</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TIPOS_META.map(t => {
                  const Icon = TIPO_ICONS[t.id];
                  const active = tipo === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNovaMeta({ ...novaMeta, tipo: t.id, alvo: '', unidade: '', periodo: 'semanal' })}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs font-medium transition-colors
                        ${active ? 'bg-vblue text-white border-vblue' : 'bg-white text-slate-600 border-slate-200 hover:border-vblue'}`}
                    >
                      <Icon size={16} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
              {(() => {
                const tipoInfo = TIPOS_META.find(t => t.id === tipo);
                return tipoInfo ? (
                  <div className="bg-vblue-50 border border-vblue-100 rounded-lg px-4 py-3 text-xs text-slate-600 space-y-1">
                    <p className="font-medium text-slate-700">{tipoInfo.descricao}</p>
                    <p className="text-slate-500">{tipoInfo.exemplo}</p>
                  </div>
                ) : null;
              })()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tituloMeta">Título</Label>
                <Input
                  id="tituloMeta"
                  placeholder="Ex: Ler 20 páginas por dia"
                  value={novaMeta.titulo}
                  onChange={e => setNovaMeta({ ...novaMeta, titulo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="membroMeta">Para quem?</Label>
                <select
                  id="membroMeta"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vblue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={novaMeta.membroId}
                  onChange={e => setNovaMeta({ ...novaMeta, membroId: e.target.value })}
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
                onChange={e => setNovaMeta({ ...novaMeta, descricao: e.target.value })}
              />
            </div>

            {/* Extra fields for FREQUENCIA */}
            {tipo === 'frequencia' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alvoMeta">Quantas vezes por período?</Label>
                  <Input
                    id="alvoMeta"
                    type="number"
                    min="1"
                    placeholder="Ex: 3"
                    value={novaMeta.alvo}
                    onChange={e => setNovaMeta({ ...novaMeta, alvo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodoFreq">Período</Label>
                  <select
                    id="periodoFreq"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vblue"
                    value={novaMeta.periodo}
                    onChange={e => setNovaMeta({ ...novaMeta, periodo: e.target.value })}
                  >
                    <option value="diario">Diário</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensal">Mensal</option>
                  </select>
                </div>
              </div>
            )}

            {/* Extra fields for QUANTITATIVO */}
            {tipo === 'quantitativo' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alvoQuant">Alvo</Label>
                  <Input
                    id="alvoQuant"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Ex: 10"
                    value={novaMeta.alvo}
                    onChange={e => setNovaMeta({ ...novaMeta, alvo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unidadeMeta">Unidade</Label>
                  <Input
                    id="unidadeMeta"
                    placeholder="Ex: horas, km, páginas"
                    value={novaMeta.unidade}
                    onChange={e => setNovaMeta({ ...novaMeta, unidade: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodoMeta">Período</Label>
                  <select
                    id="periodoMeta"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vblue"
                    value={novaMeta.periodo}
                    onChange={e => setNovaMeta({ ...novaMeta, periodo: e.target.value })}
                  >
                    <option value="diario">Diário</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensal">Mensal</option>
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pilarMeta">Pilar</Label>
                <select
                  id="pilarMeta"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vblue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={novaMeta.pilar}
                  onChange={e => setNovaMeta({ ...novaMeta, pilar: e.target.value })}
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
                  onChange={e => setNovaMeta({ ...novaMeta, prazo: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-vblue hover:bg-vblue-700 text-white mt-2">
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
          const membro = meta.membroId === 'familia'
            ? { nome: 'Toda a Família' }
            : membros.find(m => String(m.id) === String(meta.membroId));
          const pilar = PILARES.find(p => p.id === meta.pilar);
          const tipoMeta = meta.tipo || 'marco';
          const TipoIcon = TIPO_ICONS[tipoMeta] || CheckSquare;
          const tipoLabel = TIPOS_META.find(t => t.id === tipoMeta)?.label || 'Ação Única';
          const quantCumprida = tipoMeta === 'quantitativo' && (() => {
            const { pct } = calcQuantitativoProgress(meta.historico, meta.alvo, meta.periodo);
            return meta.alvo > 0 && pct >= 100;
          })();

          return (
            <Card
              key={meta.id}
              className={`shadow-sm border transition-all ${
                tipoMeta === 'marco' && meta.concluida
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : quantCumprida
                    ? 'border-vblue-100 bg-vblue-50 hover:shadow-md'
                    : 'border-slate-200 hover:shadow-md'
              }`}
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded text-xs font-semibold flex items-center space-x-1 ${pilar?.color}`}>
                      {pilar && <pilar.icon size={12} />}
                      <span>{pilar?.nome}</span>
                    </div>
                    <div className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1 bg-slate-100 text-slate-600">
                      <TipoIcon size={11} />
                      <span>{tipoLabel}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-vcoral hover:bg-vcoral-50"
                    onClick={() => removerMeta(meta.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <h4 className={`font-bold text-lg mb-1 ${tipoMeta === 'marco' && meta.concluida ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                  {meta.titulo}
                </h4>
                {meta.descricao && (
                  <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                    {meta.descricao}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                  <span className="flex items-center"><UserPlus size={11} className="mr-1" />{membro?.nome || 'Desconhecido'}</span>
                  {meta.prazo && (
                    <span className="flex items-center"><Calendar size={11} className="mr-1" />{new Date(meta.prazo + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3">
                  {tipoMeta === 'marco' && (
                    <Button
                      variant={meta.concluida ? 'outline' : 'default'}
                      size="sm"
                      className={`w-full ${meta.concluida
                        ? 'text-vblue border-vblue-100 bg-vblue-50 hover:bg-vblue-100'
                        : 'bg-vblue hover:bg-vblue-700 text-white'
                      }`}
                      onClick={() => alternarMetaStatus(meta.id)}
                    >
                      {meta.concluida
                        ? <><CheckCircle size={16} className="mr-2" />Concluído</>
                        : 'Marcar Feito'
                      }
                    </Button>
                  )}
                  {tipoMeta === 'habito' && (
                    <HabitoWeekGrid
                      meta={meta}
                      adicionarCheckin={adicionarCheckin}
                      removerCheckin={removerCheckin}
                    />
                  )}
                  {tipoMeta === 'frequencia' && (
                    <FrequenciaCounter
                      meta={meta}
                      adicionarCheckin={adicionarCheckin}
                      removerCheckin={removerCheckin}
                    />
                  )}
                  {tipoMeta === 'quantitativo' && (
                    <QuantitativoProgress
                      meta={meta}
                      adicionarCheckin={adicionarCheckin}
                      removerCheckin={removerCheckin}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
