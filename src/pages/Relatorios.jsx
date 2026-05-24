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
  // Filtros
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Ordenação
  const [ordenarPor, setOrdenarPor] = useState('data'); // 'data', 'descricao', 'valor'
  const [ordemDirecao, setOrdemDirecao] = useState('desc'); // 'asc', 'desc'

  // Resetar todos os filtros
  const limparFiltros = () => {
    setBusca('');
    setTipoFiltro('todos');
    setStatusFiltro('todos');
    setCategoriaFiltro('todos');
    setDataInicio('');
    setDataFim('');
  };

  // Filtragem dinâmica das transações
  const transacoesFiltradas = useMemo(() => {
    let resultado = [...financas.transacoes];

    // Busca Textual
    if (busca.trim() !== '') {
      const termo = busca.toLowerCase();
      resultado = resultado.filter(t => 
        t.descricao.toLowerCase().includes(termo) || 
        (t.categoria && t.categoria.toLowerCase().includes(termo))
      );
    }

    // Tipo (Receita/Despesa)
    if (tipoFiltro !== 'todos') {
      resultado = resultado.filter(t => t.tipo === tipoFiltro);
    }

    // Status (Efetivado/Pendente)
    if (statusFiltro !== 'todos') {
      const isEfetuadoFiltro = statusFiltro === 'efetuado';
      resultado = resultado.filter(t => {
        const isEfetuado = t.efetuado !== false;
        return isEfetuado === isEfetuadoFiltro;
      });
    }

    // Categoria
    if (categoriaFiltro !== 'todos') {
      resultado = resultado.filter(t => t.categoria === categoriaFiltro);
    }

    // Período de Datas
    if (dataInicio) {
      resultado = resultado.filter(t => t.data >= dataInicio);
    }
    if (dataFim) {
      resultado = resultado.filter(t => t.data <= dataFim);
    }

    // Ordenação
    resultado.sort((a, b) => {
      let valorA = a[ordenarPor];
      let valorB = b[ordenarPor];

      if (ordenarPor === 'data') {
        valorA = new Date(a.data);
        valorB = new Date(b.data);
      } else if (ordenarPor === 'descricao') {
        valorA = a.descricao.toLowerCase();
        valorB = b.descricao.toLowerCase();
      } else if (ordenarPor === 'valor') {
        valorA = a.valor;
        valorB = b.valor;
      }

      if (valorA < valorB) return ordemDirecao === 'asc' ? -1 : 1;
      if (valorA > valorB) return ordemDirecao === 'asc' ? 1 : -1;
      return 0;
    });

    return resultado;
  }, [financas.transacoes, busca, tipoFiltro, statusFiltro, categoriaFiltro, dataInicio, dataFim, ordenarPor, ordemDirecao]);

  // Cálculos dinâmicos baseados nas transações filtradas
  const estatisticas = useMemo(() => {
    let totalReceitas = 0;
    let totalDespesas = 0;

    transacoesFiltradas.forEach(t => {
      if (t.tipo === 'receita') {
        totalReceitas += t.valor;
      } else {
        totalDespesas += t.valor;
      }
    });

    return {
      receitas: totalReceitas,
      despesas: totalDespesas,
      saldo: totalReceitas - totalDespesas
    };
  }, [transacoesFiltradas]);

  // Alternar direção de ordenação
  const handleOrdenar = (campo) => {
    if (ordenarPor === campo) {
      setOrdemDirecao(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenarPor(campo);
      setOrdemDirecao('desc');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <FileText className="mr-2 text-indigo-600" size={24} />
          Relatório Financeiro Global
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={limparFiltros} 
          className="text-slate-600 border-slate-200 hover:bg-slate-50 text-xs flex items-center"
        >
          <RefreshCw size={12} className="mr-1.5" /> Limpar Filtros
        </Button>
      </div>

      {/* Painel de Filtros */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100 py-3.5">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center">
            <Filter size={14} className="mr-2" /> Painel de Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca descritiva */}
            <div className="space-y-1.5 col-span-1 md:col-span-2 relative">
              <Label htmlFor="buscaGlobal">Buscar por Descrição</Label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <Input 
                  id="buscaGlobal" 
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  placeholder="Ex: Supermercado, Salário, Compra..."
                  className="pl-9 h-10"
                />
              </div>
            </div>

            {/* Categoria */}
            <div className="space-y-1.5">
              <Label htmlFor="filtroCategoria">Categoria</Label>
              <select 
                id="filtroCategoria"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Tipo */}
            <div className="space-y-1.5">
              <Label htmlFor="filtroTipo">Tipo</Label>
              <select 
                id="filtroTipo"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                value={tipoFiltro}
                onChange={e => setTipoFiltro(e.target.value)}
              >
                <option value="todos">Todos os Tipos</option>
                <option value="receita">Receitas (+)</option>
                <option value="despesa">Despesas (-)</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label htmlFor="filtroStatus">Status</Label>
              <select 
                id="filtroStatus"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                value={statusFiltro}
                onChange={e => setStatusFiltro(e.target.value)}
              >
                <option value="todos">Todos os Status</option>
                <option value="efetuado">Efetivado (Pago/Recebido)</option>
                <option value="pendente">Pendente (Agendado)</option>
              </select>
            </div>

            {/* Data Inicial */}
            <div className="space-y-1.5">
              <Label htmlFor="dataInicio">De (Data Inicial)</Label>
              <Input 
                id="dataInicio" 
                type="date"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Data Final */}
            <div className="space-y-1.5">
              <Label htmlFor="dataFim">Até (Data Final)</Label>
              <Input 
                id="dataFim" 
                type="date"
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Consolidados dos Dados Filtrados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-white shadow-sm border-emerald-100">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Receitas Filtradas</p>
              <h3 className="text-2xl font-bold text-slate-800">R$ {estatisticas.receitas.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg">
              <ArrowUpRight size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-white shadow-sm border-rose-100">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">Despesas Filtradas</p>
              <h3 className="text-2xl font-bold text-slate-800">R$ {estatisticas.despesas.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-rose-100 text-rose-700 rounded-lg">
              <ArrowDownRight size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br shadow-sm border ${
          estatisticas.saldo >= 0 
            ? 'from-blue-50 to-white border-blue-100' 
            : 'from-amber-50 to-white border-amber-100'
        }`}>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                estatisticas.saldo >= 0 ? 'text-blue-600' : 'text-amber-700'
              }`}>
                Saldo do Período
              </p>
              <h3 className={`text-2xl font-bold ${
                estatisticas.saldo >= 0 ? 'text-blue-700' : 'text-amber-800'
              }`}>
                R$ {estatisticas.saldo.toFixed(2)}
              </h3>
            </div>
            <div className={`p-3 rounded-lg ${
              estatisticas.saldo >= 0 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
            }`}>
              <Wallet size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listagem Tabular */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between py-3 sm:py-4">
          <CardTitle className="text-base text-slate-700 flex items-center">
            <DollarSign size={16} className="mr-2 text-indigo-600" />
            Lançamentos Encontrados
          </CardTitle>
          <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
            {transacoesFiltradas.length} item(ns)
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-xs font-semibold uppercase">
                  <th 
                    className="p-4 cursor-pointer hover:text-indigo-600 transition-colors select-none" 
                    onClick={() => handleOrdenar('data')}
                  >
                    Data {ordenarPor === 'data' && (ordemDirecao === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-4">Tipo</th>
                  <th 
                    className="p-4 cursor-pointer hover:text-indigo-600 transition-colors select-none"
                    onClick={() => handleOrdenar('descricao')}
                  >
                    Descrição {ordenarPor === 'descricao' && (ordemDirecao === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Status</th>
                  <th 
                    className="p-4 cursor-pointer hover:text-indigo-600 transition-colors text-right select-none"
                    onClick={() => handleOrdenar('valor')}
                  >
                    Valor {ordenarPor === 'valor' && (ordemDirecao === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {transacoesFiltradas.map(t => {
                  const isEfetuado = t.efetuado !== false;
                  const dataObj = new Date(t.data + 'T12:00:00');
                  const dataFormatada = isNaN(dataObj.getTime()) 
                    ? t.data 
                    : dataObj.toLocaleDateString('pt-BR');

                  return (
                    <tr 
                      key={t.id} 
                      className={`hover:bg-slate-50/40 transition-colors ${
                        !isEfetuado ? 'bg-amber-50/10' : ''
                      }`}
                    >
                      {/* Data */}
                      <td className="p-4 font-medium whitespace-nowrap text-slate-600 text-xs hidden md:table-cell">
                          <span className="flex items-center">
                            <Calendar size={12} className="mr-1.5 text-slate-400" />
                            {dataFormatada}
                          </span>
                        </td>

                      {/* Tipo */}
                      <td className="p-4">
                        <span className={`p-1.5 rounded-full inline-block ${
                          t.tipo === 'receita' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {t.tipo === 'receita' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        </span>
                      </td>

                      {/* Descrição */}
                      <td className="p-4 font-medium text-slate-800 text-xs">
                        {t.descricao}
                      </td>

                      {/* Categoria */}
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {t.categoria || 'Sem categoria'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <button
                          onClick={() => alternarTransacaoStatus(t.id)}
                          className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all hover:scale-105 cursor-pointer ${
                            isEfetuado 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                          title="Clique para alternar o status"
                        >
                          {isEfetuado ? <Check size={10} /> : <Clock size={10} />}
                          <span>{isEfetuado ? 'Efetivado' : 'Pendente'}</span>
                        </button>
                      </td>

                      {/* Valor */}
                      <td className={`p-4 text-right font-bold text-xs sm:text-sm ${
                          t.tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {/* Date for mobile */}
                          <div className="block md:hidden text-xs text-slate-600 flex items-center justify-center mb-1">
                            <Calendar size={12} className="mr-1.5" /> {dataFormatada}
                          </div>
                          <span>{t.tipo === 'receita' ? '+' : '-'} R$ {t.valor.toFixed(2)}</span>
                        </td>

                      {/* Ações */}
                      <td className="p-4 text-center w-12">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50"
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
                    <td colSpan="7" className="p-16 text-center text-slate-500">
                      <Wallet size={40} className="mx-auto mb-3 opacity-20" />
                      <p className="font-medium text-slate-400">Nenhum lançamento corresponde aos filtros ativos.</p>
                      <button onClick={limparFiltros} className="mt-2 text-xs font-semibold text-indigo-600 hover:underline">
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
