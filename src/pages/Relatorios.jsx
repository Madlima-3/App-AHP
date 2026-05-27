import { useState, useMemo } from 'react';
import { FileText, Search, ArrowUpRight, ArrowDownRight, Trash2, Calendar, Clock, Check, Filter, RefreshCw, DollarSign, Wallet } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export default function Relatorios({
  financas,
  orcamentos,
  alternarTransacaoStatus,
  removerTransacao
}) {
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('data');
  const [ordemDirecao, setOrdemDirecao] = useState('desc');

  const limparFiltros = () => {
    setBusca('');
    setTipoFiltro('todos');
    setStatusFiltro('todos');
    setCategoriaFiltro('todos');
    setDataInicio('');
    setDataFim('');
  };

  const transacoesFiltradas = useMemo(() => {
    let resultado = [...financas.transacoes];

    if (busca.trim() !== '') {
      const termo = busca.toLowerCase();
      resultado = resultado.filter(t =>
        t.descricao.toLowerCase().includes(termo) ||
        (t.categoria && t.categoria.toLowerCase().includes(termo))
      );
    }

    if (tipoFiltro !== 'todos') resultado = resultado.filter(t => t.tipo === tipoFiltro);

    if (statusFiltro !== 'todos') {
      const isEfetuadoFiltro = statusFiltro === 'efetuado';
      resultado = resultado.filter(t => (t.efetuado !== false) === isEfetuadoFiltro);
    }

    if (categoriaFiltro !== 'todos') resultado = resultado.filter(t => t.categoria === categoriaFiltro);
    if (dataInicio) resultado = resultado.filter(t => t.data >= dataInicio);
    if (dataFim) resultado = resultado.filter(t => t.data <= dataFim);

    resultado.sort((a, b) => {
      let valorA, valorB;
      if (ordenarPor === 'data') {
        valorA = new Date(a.data); valorB = new Date(b.data);
      } else if (ordenarPor === 'descricao') {
        valorA = a.descricao.toLowerCase(); valorB = b.descricao.toLowerCase();
      } else {
        valorA = a.valor; valorB = b.valor;
      }
      if (valorA < valorB) return ordemDirecao === 'asc' ? -1 : 1;
      if (valorA > valorB) return ordemDirecao === 'asc' ? 1 : -1;
      return 0;
    });

    return resultado;
  }, [financas.transacoes, busca, tipoFiltro, statusFiltro, categoriaFiltro, dataInicio, dataFim, ordenarPor, ordemDirecao]);

  const estatisticas = useMemo(() => {
    let totalReceitas = 0, totalDespesas = 0;
    transacoesFiltradas.forEach(t => {
      if (t.tipo === 'receita') totalReceitas += t.valor;
      else totalDespesas += t.valor;
    });
    return { receitas: totalReceitas, despesas: totalDespesas, saldo: totalReceitas - totalDespesas };
  }, [transacoesFiltradas]);

  const handleOrdenar = (campo) => {
    if (ordenarPor === campo) setOrdemDirecao(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setOrdenarPor(campo); setOrdemDirecao('desc'); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center">
          <FileText className="mr-2 text-vblue shrink-0" size={22} />
          Relatório Financeiro Global
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={limparFiltros}
          className="text-slate-600 border-slate-200 hover:bg-bgray-100 text-xs flex items-center shrink-0"
        >
          <RefreshCw size={12} className="mr-1.5" /> Limpar Filtros
        </Button>
      </div>

      {/* Painel de Filtros */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100 py-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center">
            <Filter size={14} className="mr-2" /> Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4">

          {/* Linha 1: Busca + Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="buscaGlobal">Buscar por Descrição</Label>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="buscaGlobal"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  placeholder="Ex: Supermercado, Salário..."
                  className="pl-9 h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="filtroCategoria">Categoria</Label>
              <select
                id="filtroCategoria"
                className="flex h-10 w-full min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vblue"
                value={categoriaFiltro}
                onChange={e => setCategoriaFiltro(e.target.value)}
              >
                <option value="todos">Todas as Categorias</option>
                <option value="Sem categoria">Sem categoria</option>
                {orcamentos.map(orc => (
                  <option key={orc.categoria} value={orc.categoria}>{orc.categoria}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Linha 2: Tipo / Status / Datas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="filtroTipo">Tipo</Label>
              <select
                id="filtroTipo"
                className="flex h-10 w-full min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vblue"
                value={tipoFiltro}
                onChange={e => setTipoFiltro(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="receita">Receitas (+)</option>
                <option value="despesa">Despesas (-)</option>
              </select>
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="filtroStatus">Status</Label>
              <select
                id="filtroStatus"
                className="flex h-10 w-full min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vblue"
                value={statusFiltro}
                onChange={e => setStatusFiltro(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="efetuado">Efetivado</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="dataInicio">De</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className="h-10 w-full min-w-0 text-sm"
              />
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="dataFim">Até</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
                className="h-10 w-full min-w-0 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Totais — 1 col mobile, 3 cols sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-vblue-50 to-white shadow-sm border-vblue-100">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="min-w-0 mr-3">
              <p className="text-xs font-semibold text-vblue uppercase tracking-wider mb-1 truncate">Receitas</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">
                R$ {estatisticas.receitas.toFixed(2)}
              </h3>
            </div>
            <div className="p-2.5 sm:p-3 bg-vblue-100 text-vblue rounded-lg shrink-0">
              <ArrowUpRight size={22} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-vcoral-50 to-white shadow-sm border-vcoral-100">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="min-w-0 mr-3">
              <p className="text-xs font-semibold text-vcoral uppercase tracking-wider mb-1 truncate">Despesas</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">
                R$ {estatisticas.despesas.toFixed(2)}
              </h3>
            </div>
            <div className="p-2.5 sm:p-3 bg-vcoral-100 text-vcoral rounded-lg shrink-0">
              <ArrowDownRight size={22} />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br shadow-sm border ${
          estatisticas.saldo >= 0 ? 'from-vblue-50 to-white border-vblue-100' : 'from-vyellow-50 to-white border-vyellow-100'
        }`}>
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="min-w-0 mr-3">
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1 truncate ${
                estatisticas.saldo >= 0 ? 'text-vblue' : 'text-vyellow-700'
              }`}>Saldo</p>
              <h3 className={`text-xl sm:text-2xl font-bold truncate ${
                estatisticas.saldo >= 0 ? 'text-vblue' : 'text-vyellow-800'
              }`}>
                R$ {estatisticas.saldo.toFixed(2)}
              </h3>
            </div>
            <div className={`p-2.5 sm:p-3 rounded-lg shrink-0 ${
              estatisticas.saldo >= 0 ? 'bg-vblue-100 text-vblue' : 'bg-vyellow-100 text-vyellow-800'
            }`}>
              <Wallet size={22} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Lançamentos */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between py-3 px-4 sm:px-6">
          <CardTitle className="text-sm sm:text-base text-slate-700 flex items-center">
            <DollarSign size={16} className="mr-2 text-vblue shrink-0" />
            Lançamentos Encontrados
          </CardTitle>
          <span className="text-xs font-semibold bg-bgray-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0 ml-2">
            {transacoesFiltradas.length} item(ns)
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-bgray-100/50 text-slate-400 text-xs font-semibold uppercase">
                  <th
                    className="px-3 py-3 md:px-4 cursor-pointer hover:text-vblue transition-colors select-none hidden md:table-cell whitespace-nowrap"
                    onClick={() => handleOrdenar('data')}
                  >
                    Data {ordenarPor === 'data' && (ordemDirecao === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="px-3 py-3 md:px-4">Tipo</th>
                  <th
                    className="px-3 py-3 md:px-4 cursor-pointer hover:text-vblue transition-colors select-none"
                    onClick={() => handleOrdenar('descricao')}
                  >
                    Descrição {ordenarPor === 'descricao' && (ordemDirecao === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="px-3 py-3 md:px-4 hidden lg:table-cell">Categoria</th>
                  <th className="px-3 py-3 md:px-4 hidden sm:table-cell whitespace-nowrap">Status</th>
                  <th
                    className="px-3 py-3 md:px-4 cursor-pointer hover:text-vblue transition-colors text-right select-none whitespace-nowrap"
                    onClick={() => handleOrdenar('valor')}
                  >
                    Valor {ordenarPor === 'valor' && (ordemDirecao === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="px-3 py-3 md:px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {transacoesFiltradas.map(t => {
                  const isEfetuado = t.efetuado !== false;
                  const dataObj = new Date(t.data + 'T12:00:00');
                  const dataFormatada = isNaN(dataObj.getTime()) ? t.data : dataObj.toLocaleDateString('pt-BR');

                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-bgray-100/40 transition-colors ${!isEfetuado ? 'bg-vyellow-50/20' : ''}`}
                    >
                      {/* Data — só desktop */}
                      <td className="px-3 py-3 md:px-4 font-medium whitespace-nowrap text-slate-600 text-xs hidden md:table-cell">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-slate-400 shrink-0" />
                          {dataFormatada}
                        </span>
                      </td>

                      {/* Tipo */}
                      <td className="px-3 py-3 md:px-4">
                        <span className={`p-1.5 rounded-full inline-flex ${
                          t.tipo === 'receita' ? 'bg-vblue-50 text-vblue' : 'bg-vcoral-50 text-vcoral'
                        }`}>
                          {t.tipo === 'receita' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                        </span>
                      </td>

                      {/* Descrição */}
                      <td className="px-3 py-3 md:px-4 text-xs">
                        <p className="font-medium text-slate-800 truncate max-w-[140px] sm:max-w-[200px] md:max-w-none">
                          {t.descricao}
                        </p>
                        {/* Data inline no mobile */}
                        <span className="flex items-center gap-1 text-slate-400 mt-0.5 md:hidden">
                          <Calendar size={10} /> {dataFormatada}
                        </span>
                      </td>

                      {/* Categoria — só desktop */}
                      <td className="px-3 py-3 md:px-4 hidden lg:table-cell">
                        <span className="bg-bgray-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                          {t.categoria || 'Sem categoria'}
                        </span>
                      </td>

                      {/* Status — escondido no mobile pequeno */}
                      <td className="px-3 py-3 md:px-4 hidden sm:table-cell">
                        <button
                          onClick={() => alternarTransacaoStatus(t.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all hover:scale-105 cursor-pointer ${
                            isEfetuado
                              ? 'bg-vblue-100 text-vblue'
                              : 'bg-vyellow-100 text-vyellow-800'
                          }`}
                          title="Clique para alternar o status"
                        >
                          {isEfetuado ? <Check size={10} /> : <Clock size={10} />}
                          <span className="hidden md:inline">{isEfetuado ? 'Efetivado' : 'Pendente'}</span>
                        </button>
                      </td>

                      {/* Valor */}
                      <td className={`px-3 py-3 md:px-4 text-right font-bold text-xs sm:text-sm whitespace-nowrap ${
                        t.tipo === 'receita' ? 'text-vblue' : 'text-vcoral'
                      }`}>
                        {t.tipo === 'receita' ? '+' : '-'} R$ {t.valor.toFixed(2)}
                      </td>

                      {/* Ações */}
                      <td className="px-3 py-3 md:px-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-300 hover:text-vcoral hover:bg-vcoral-50"
                          onClick={() => removerTransacao(t.id)}
                          title="Excluir lançamento"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {transacoesFiltradas.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-slate-500">
                      <Wallet size={36} className="mx-auto mb-3 opacity-20" />
                      <p className="font-medium text-slate-400 text-sm">Nenhum lançamento corresponde aos filtros ativos.</p>
                      <button onClick={limparFiltros} className="mt-2 text-xs font-semibold text-vblue hover:underline">
                        Limpar todos os filtros
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
