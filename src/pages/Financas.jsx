import React, { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Plus, TrendingUp, Trash2, PieChart, ChevronLeft, ChevronRight, Calendar, Edit2, Check, X, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export default function Financas({ 
  financas, 
  novaTransacao, 
  setNovaTransacao, 
  adicionarTransacao, 
  removerTransacao,
  orcamentos,
  salvarOrcamento,
  editarOrcamento,
  removerOrcamento,
  alternarTransacaoStatus
}) {
  const [novaCategoriaOrcamento, setNovaCategoriaOrcamento] = useState('');
  const [novoLimiteOrcamento, setNovoLimiteOrcamento] = useState('');
  
  // Estados para edição de orçamento
  const [orcamentoEmEdicao, setOrcamentoEmEdicao] = useState(null);
  const [editCategoria, setEditCategoria] = useState('');
  const [editLimitePadrao, setEditLimitePadrao] = useState('');
  const [editLimiteMensal, setEditLimiteMensal] = useState('');

  // Estado para o filtro de mês/ano
  const [mesFiltro, setMesFiltro] = useState(new Date());

  const mesAnterior = () => {
    setMesFiltro(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const proximoMes = () => {
    setMesFiltro(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const nomeMesFormatado = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mesFiltro);
  const nomeMesCapitalizado = nomeMesFormatado.charAt(0).toUpperCase() + nomeMesFormatado.slice(1);

  // Filtrar transações pelo mês e ano selecionado
  const transacoesFiltradas = financas.transacoes.filter(t => {
    // Para evitar problemas de fuso horário, extraímos ano e mês diretamente da string "YYYY-MM-DD"
    const [ano, mes] = t.data.split('-');
    return parseInt(ano) === mesFiltro.getFullYear() && parseInt(mes) === mesFiltro.getMonth() + 1;
  });

  const receitasTotais = transacoesFiltradas.filter(t => t.tipo === 'receita').reduce((acc, curr) => acc + curr.valor, 0);
  const receitasEfetivadas = transacoesFiltradas.filter(t => t.tipo === 'receita' && t.efetuado !== false).reduce((acc, curr) => acc + curr.valor, 0);

  const despesasTotais = transacoesFiltradas.filter(t => t.tipo === 'despesa').reduce((acc, curr) => acc + curr.valor, 0);
  const despesasEfetivadas = transacoesFiltradas.filter(t => t.tipo === 'despesa' && t.efetuado !== false).reduce((acc, curr) => acc + curr.valor, 0);

  // Calcular gastos por categoria APENAS do mês selecionado
  const gastosPorCategoria = transacoesFiltradas
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
      return acc;
    }, {});

  const handleSalvarOrcamento = (e) => {
    e.preventDefault();
    if (!novaCategoriaOrcamento || !novoLimiteOrcamento) return;
    salvarOrcamento(novaCategoriaOrcamento, novoLimiteOrcamento);
    setNovaCategoriaOrcamento('');
    setNovoLimiteOrcamento('');
  };

  const iniciarEdicao = (orc) => {
    setOrcamentoEmEdicao(orc);
    setEditCategoria(orc.categoria);
    setEditLimitePadrao(orc.limite);
    const mesAnoStr = mesFiltro.toISOString().substring(0, 7);
    setEditLimiteMensal((orc.limitesMensais && orc.limitesMensais[mesAnoStr]) ? orc.limitesMensais[mesAnoStr] : '');
  };

  const cancelarEdicao = () => {
    setOrcamentoEmEdicao(null);
    setEditCategoria('');
    setEditLimitePadrao('');
    setEditLimiteMensal('');
  };

  const handleSalvarEdicao = () => {
    if (!editCategoria || !editLimitePadrao) return;
    const mesAnoStr = mesFiltro.toISOString().substring(0, 7);
    editarOrcamento(orcamentoEmEdicao, editCategoria, editLimitePadrao, editLimiteMensal, mesAnoStr);
    cancelarEdicao();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Seletor de Mês/Ano */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <Calendar className="mr-2 text-indigo-600" size={24} />
          Visão Mensal
        </h2>
        <div className="flex items-center space-x-4 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
          <Button variant="ghost" size="icon" onClick={mesAnterior} className="hover:bg-slate-200 text-slate-600">
            <ChevronLeft size={20} />
          </Button>
          <span className="font-semibold text-slate-700 min-w-[140px] text-center">
            {nomeMesCapitalizado}
          </span>
          <Button variant="ghost" size="icon" onClick={proximoMes} className="hover:bg-slate-200 text-slate-600">
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 text-white shadow-sm border-slate-700">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Saldo Real (Efetivado)</p>
                <h3 className="text-3xl font-bold">R$ {financas.saldo.toFixed(2)}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Projetado: R$ {(financas.saldoPrevisto ?? financas.saldo).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-slate-700 rounded-lg">
                <Wallet size={24} className="text-slate-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-emerald-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Receitas (Efetivadas)</p>
                <h3 className="text-2xl font-bold text-emerald-600">R$ {receitasEfetivadas.toFixed(2)}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Total planejado: R$ {receitasTotais.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <ArrowUpRight size={24} className="text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-rose-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Despesas (Efetivadas)</p>
                <h3 className="text-2xl font-bold text-rose-600">R$ {despesasEfetivadas.toFixed(2)}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Total planejado: R$ {despesasTotais.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-rose-50 rounded-lg">
                <ArrowDownRight size={24} className="text-rose-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teto de Gastos / Orçamentos */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-lg text-slate-700 flex items-center">
            <PieChart className="mr-2" size={20} />
            Orçamentos por Categoria (Mês Atual)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSalvarOrcamento} className="flex flex-col sm:flex-row gap-4 items-end mb-6">
            <div className="w-full sm:w-1/3 space-y-2">
              <Label htmlFor="catOrcamento">Categoria</Label>
              <Input 
                id="catOrcamento" 
                placeholder="Ex: Alimentação" 
                value={novaCategoriaOrcamento}
                onChange={e => setNovaCategoriaOrcamento(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-1/3 space-y-2">
              <Label htmlFor="limiteOrcamento">Limite (R$)</Label>
              <Input 
                id="limiteOrcamento" 
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00" 
                value={novoLimiteOrcamento}
                onChange={e => setNovoLimiteOrcamento(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
              <Plus size={16} className="mr-2" /> Adicionar Limite
            </Button>
          </form>

          <div className="space-y-4">
            {orcamentos.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Nenhum orçamento definido ainda.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orcamentos.map(orc => {
                  const mesAnoStr = mesFiltro.toISOString().substring(0, 7);
                  const limiteAtual = (orc.limitesMensais && orc.limitesMensais[mesAnoStr] !== undefined) 
                    ? orc.limitesMensais[mesAnoStr] 
                    : orc.limite;

                  const gasto = gastosPorCategoria[orc.categoria] || 0;
                  const percentual = (gasto / limiteAtual) * 100;
                  const percentualLimitado = Math.min(percentual, 100);
                  
                  let barColor = 'bg-emerald-500';
                  if (percentual > 100) barColor = 'bg-rose-500';
                  else if (percentual >= 80) barColor = 'bg-amber-500';

                  let textColor = 'text-emerald-600';
                  if (percentual > 100) textColor = 'text-rose-600';
                  else if (percentual >= 80) textColor = 'text-amber-600';

                  const isEditing = orcamentoEmEdicao && orcamentoEmEdicao.categoria === orc.categoria;

                  return (
                    <div key={orc.categoria} className="bg-slate-50 p-4 rounded-xl border border-slate-100 group relative">
                      {isEditing ? (
                        <div className="flex flex-col space-y-3 mb-2">
                           <Input 
                             value={editCategoria} 
                             onChange={e => setEditCategoria(e.target.value)} 
                             placeholder="Categoria" 
                             className="h-8 text-sm" 
                           />
                           <div className="flex items-end space-x-2">
                             <div className="flex-1 space-y-1">
                               <Label className="text-[10px] text-slate-500">Padrão Fixo</Label>
                               <Input 
                                 type="number" 
                                 step="0.01" 
                                 value={editLimitePadrao} 
                                 onChange={e => setEditLimitePadrao(e.target.value)} 
                                 placeholder="Fixo" 
                                 className="h-8 text-sm w-full" 
                               />
                             </div>
                             <div className="flex-1 space-y-1">
                               <Label className="text-[10px] text-indigo-500 font-semibold">Exceção deste Mês</Label>
                               <Input 
                                 type="number" 
                                 step="0.01" 
                                 value={editLimiteMensal} 
                                 onChange={e => setEditLimiteMensal(e.target.value)} 
                                 placeholder="Mês atual" 
                                 className="h-8 text-sm w-full border-indigo-200 focus-visible:ring-indigo-500" 
                               />
                             </div>
                             <div className="flex space-x-1 pb-0.5">
                               <Button size="icon" className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700" onClick={handleSalvarEdicao}>
                                 <Check size={14} />
                               </Button>
                               <Button size="icon" variant="outline" className="h-8 w-8 text-slate-500" onClick={cancelarEdicao}>
                                 <X size={14} />
                               </Button>
                             </div>
                           </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-end mb-2">
                          <div>
                            <p className="font-semibold text-slate-700 flex items-center">
                              {orc.categoria}
                              {orc.limitesMensais && orc.limitesMensais[mesAnoStr] !== undefined && (
                                <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium">Exceção do Mês</span>
                              )}
                            </p>
                            <p className={`text-sm font-medium ${textColor}`}>
                              R$ {gasto.toFixed(2)} <span className="text-slate-400 font-normal">de R$ {limiteAtual.toFixed(2)}</span>
                            </p>
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-slate-400 hover:text-indigo-600" 
                              onClick={() => iniciarEdicao(orc)}
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-slate-300 hover:text-red-500" 
                              onClick={() => removerOrcamento(orc.categoria)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden mt-1">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`} 
                          style={{ width: `${percentualLimitado}%` }}
                        ></div>
                      </div>
                      {percentual > 100 && !isEditing && (
                        <p className="text-xs text-rose-500 mt-1 font-medium text-right">
                          Excedeu R$ {(gasto - limiteAtual).toFixed(2)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nova Transação */}
        <Card className="lg:col-span-1 shadow-sm border-slate-200 h-fit">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-lg text-slate-700 flex items-center">
              <Plus className="mr-2" size={20} />
              Nova Transação
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={adicionarTransacao} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant={novaTransacao.tipo === 'despesa' ? 'default' : 'outline'}
                    className={`flex-1 ${novaTransacao.tipo === 'despesa' ? 'bg-rose-600 hover:bg-rose-700' : ''}`}
                    onClick={() => setNovaTransacao({...novaTransacao, tipo: 'despesa'})}
                  >
                    Despesa
                  </Button>
                  <Button 
                    type="button"
                    variant={novaTransacao.tipo === 'receita' ? 'default' : 'outline'}
                    className={`flex-1 ${novaTransacao.tipo === 'receita' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    onClick={() => setNovaTransacao({...novaTransacao, tipo: 'receita'})}
                  >
                    Receita
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status do Lançamento</Label>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant={novaTransacao.efetuado !== false ? 'default' : 'outline'}
                    className={`flex-1 text-xs ${novaTransacao.efetuado !== false ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    onClick={() => setNovaTransacao({...novaTransacao, efetuado: true})}
                  >
                    Efetivado (Pago/Rec.)
                  </Button>
                  <Button 
                    type="button"
                    variant={novaTransacao.efetuado === false ? 'default' : 'outline'}
                    className={`flex-1 text-xs ${novaTransacao.efetuado === false ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                    onClick={() => setNovaTransacao({...novaTransacao, efetuado: false})}
                  >
                    Pendente (Agendado)
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descTransacao">Descrição</Label>
                <Input 
                  id="descTransacao" 
                  placeholder="Ex: Supermercado" 
                  value={novaTransacao.descricao}
                  onChange={e => setNovaTransacao({...novaTransacao, descricao: e.target.value})}
                />
              </div>

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
                  onChange={e => setNovaTransacao({...novaTransacao, valor: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Repetição</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button type="button" variant={(novaTransacao.repeticao || 'unica') === 'unica' ? 'default' : 'outline'} className={`text-xs ${(novaTransacao.repeticao || 'unica') === 'unica' ? 'bg-slate-800' : ''}`} onClick={() => setNovaTransacao({...novaTransacao, repeticao: 'unica', quantidadeMeses: ''})}>Única</Button>
                  <Button type="button" variant={novaTransacao.repeticao === 'parcelada' ? 'default' : 'outline'} className={`text-xs ${novaTransacao.repeticao === 'parcelada' ? 'bg-slate-800' : ''}`} onClick={() => setNovaTransacao({...novaTransacao, repeticao: 'parcelada', quantidadeMeses: '2'})}>Parcelada</Button>
                  <Button type="button" variant={novaTransacao.repeticao === 'fixa' ? 'default' : 'outline'} className={`text-xs ${novaTransacao.repeticao === 'fixa' ? 'bg-slate-800' : ''}`} onClick={() => setNovaTransacao({...novaTransacao, repeticao: 'fixa', quantidadeMeses: '12'})}>Fixa</Button>
                </div>
              </div>

              {novaTransacao.repeticao !== 'unica' && novaTransacao.repeticao !== undefined && (
                <div className="space-y-2">
                  <Label htmlFor="qtdMeses">{novaTransacao.repeticao === 'parcelada' ? 'Número de Parcelas' : 'Repetir por Quantos Meses?'}</Label>
                  <Input 
                    id="qtdMeses" 
                    type="number"
                    min="2"
                    max="120"
                    value={novaTransacao.quantidadeMeses}
                    onChange={e => setNovaTransacao({...novaTransacao, quantidadeMeses: e.target.value})}
                  />
                  {novaTransacao.repeticao === 'parcelada' && novaTransacao.quantidadeMeses && novaTransacao.valor && (
                    <p className="text-xs text-slate-500 text-right mt-1">
                      Serão {novaTransacao.quantidadeMeses} parcelas de R$ {(parseFloat(novaTransacao.valor) / parseInt(novaTransacao.quantidadeMeses)).toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="catTransacao">Categoria</Label>
                  <select 
                    id="catTransacao" 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={novaTransacao.categoria}
                    onChange={e => setNovaTransacao({...novaTransacao, categoria: e.target.value})}
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
                    onChange={e => setNovaTransacao({...novaTransacao, data: e.target.value})}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 mt-2">
                Registrar {novaTransacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Histórico */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-lg text-slate-700 flex items-center">
              <TrendingUp className="mr-2" size={20} />
              Histórico do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {transacoesFiltradas.map(transacao => (
                <div 
                  key={transacao.id} 
                  className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    transacao.efetuado === false 
                      ? 'bg-slate-50/40 opacity-85 border-l-4 border-l-amber-500' 
                      : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => alternarTransacaoStatus(transacao.id)}
                      className={`p-2 rounded-full transition-all relative group cursor-pointer ${
                        transacao.efetuado === false 
                          ? 'bg-amber-100 text-amber-700 hover:bg-emerald-100 hover:text-emerald-700' 
                          : transacao.tipo === 'receita' 
                            ? 'bg-emerald-100 text-emerald-600 hover:bg-amber-100 hover:text-amber-700' 
                            : 'bg-rose-100 text-rose-600 hover:bg-amber-100 hover:text-amber-700'
                      }`}
                      title={transacao.efetuado === false ? "Marcar como Efetivado" : "Marcar como Pendente"}
                    >
                      {transacao.efetuado === false ? (
                        <Clock size={20} className="animate-pulse" />
                      ) : transacao.tipo === 'receita' ? (
                        <ArrowUpRight size={20} />
                      ) : (
                        <ArrowDownRight size={20} />
                      )}
                      
                      <span className="absolute hidden group-hover:block bg-slate-900 text-white text-[10px] py-1 px-2 rounded -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-10 shadow-md">
                        {transacao.efetuado === false ? "Pendente - Clique para Efetivar" : "Efetivado - Clique para Pendente"}
                      </span>
                    </button>

                    <div>
                      <div className="flex items-center space-x-2">
                        <p className={`font-medium ${transacao.efetuado === false ? 'text-slate-500 line-through decoration-dotted decoration-amber-500' : 'text-slate-800'}`}>
                          {transacao.descricao}
                        </p>
                        {transacao.efetuado === false && (
                          <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                            Agendado
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2 text-xs text-slate-500 mt-1">
                        <span className="bg-slate-100 px-2 py-0.5 rounded">{transacao.categoria}</span>
                        <span>{new Date(transacao.data).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`font-bold ${transacao.tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {transacao.tipo === 'receita' ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
                    </span>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-500" onClick={() => removerTransacao(transacao.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
              {transacoesFiltradas.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                  <Wallet size={40} className="mx-auto mb-3 opacity-20" />
                  <p>Nenhuma movimentação registrada neste mês.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
