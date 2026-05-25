import { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Plus, TrendingUp, Trash2, PieChart, ChevronLeft, ChevronRight, Calendar, Edit2, Check, X, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import ModalNovaTransacao from '../components/ModalNovaTransacao';
import ModalNovaConta from '../components/ModalNovaConta';
import ModalNovoOrcamento from '../components/ModalNovoOrcamento';

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
  alternarTransacaoStatus,
  editarTransacao,
  contas = [],
  adicionarConta,
  removerConta
}) {
  // Estados para edição de orçamento
  const [orcamentoEmEdicaoObj, setOrcamentoEmEdicaoObj] = useState(null);
  const [editCategoria, setEditCategoria] = useState('');
  const [editLimitePadrao, setEditLimitePadrao] = useState('');
  const [editLimiteMensal, setEditLimiteMensal] = useState('');

  // Estado para o filtro de mês/ano
  const [mesFiltro, setMesFiltro] = useState(new Date());

  // Estados para edição de transação
  const [transacaoEmEdicao, setTransacaoEmEdicao] = useState(null);
  const [editTransDesc, setEditTransDesc] = useState('');
  const [editTransValor, setEditTransValor] = useState('');
  const [editTransCategoria, setEditTransCategoria] = useState('');
  const [editTransData, setEditTransData] = useState('');
  const [editTransTipo, setEditTransTipo] = useState('');
  const [editTransEfetuado, setEditTransEfetuado] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showContaModal, setShowContaModal] = useState(false);
  const [showOrcamentoModal, setShowOrcamentoModal] = useState(false);

  const iniciarEdicaoTransacao = (trans) => {
    setTransacaoEmEdicao(trans.id);
    setEditTransDesc(trans.descricao);
    setEditTransValor(trans.valor);
    setEditTransCategoria(trans.categoria || 'Sem categoria');
    setEditTransData(trans.data);
    setEditTransTipo(trans.tipo);
    setEditTransEfetuado(trans.efetuado !== false);
  };

  const cancelarEdicaoTransacao = () => {
    setTransacaoEmEdicao(null);
    setEditTransDesc('');
    setEditTransValor('');
    setEditTransCategoria('');
    setEditTransData('');
    setEditTransTipo('');
    setEditTransEfetuado(true);
  };

  const handleSalvarEdicaoTransacao = () => {
    if (!editTransDesc || !editTransValor) return;
    editarTransacao(transacaoEmEdicao, {
      descricao: editTransDesc,
      valor: parseFloat(editTransValor),
      categoria: editTransCategoria,
      data: editTransData,
      tipo: editTransTipo,
      efetuado: editTransEfetuado
    });
    cancelarEdicaoTransacao();
  };

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



  const iniciarEdicao = (orc) => {
    setOrcamentoEmEdicaoObj(orc);
    setEditCategoria(orc.categoria);
    setEditLimitePadrao(orc.limite);
    const mesAnoStr = `${mesFiltro.getFullYear()}-${String(mesFiltro.getMonth() + 1).padStart(2, '0')}`;
    setEditLimiteMensal((orc.limitesMensais && orc.limitesMensais[mesAnoStr]) ? orc.limitesMensais[mesAnoStr] : '');
  };

  const cancelarEdicao = () => {
    setOrcamentoEmEdicaoObj(null);
    setEditCategoria('');
    setEditLimitePadrao('');
    setEditLimiteMensal('');
  };

  const handleSalvarEdicao = () => {
    if (!editCategoria || !editLimitePadrao) return;
    const mesAnoStr = `${mesFiltro.getFullYear()}-${String(mesFiltro.getMonth() + 1).padStart(2, '0')}`;
    editarOrcamento(orcamentoEmEdicaoObj, editCategoria, editLimitePadrao, editLimiteMensal, mesAnoStr);
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

      {/* Botão de novo lançamento (menu superior) */}
      <section className="flex justify-end mb-4">
        {console.log("Renderizando botão Novo Lançamento na página Finanças")}
        <Button variant="default" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setShowModal(true)}>
          <Plus className="mr-1" size={16} /> Novo Lançamento
        </Button>
   
   
   

   
   

      </section>

      {/* Minhas Contas */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <Wallet className="mr-2 text-indigo-600" size={20} /> Minhas Contas
          </h3>
          <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => setShowContaModal(true)}>
            <Plus size={14} className="mr-1" /> Nova Conta
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {contas.length === 0 && (
            <div className="col-span-full p-4 border border-dashed border-slate-300 rounded-xl text-center text-slate-500 text-sm">
              Nenhuma conta cadastrada. Cadastre sua primeira conta!
            </div>
          )}
          {contas.map(conta => {
            const transacoesDaConta = financas.transacoes.filter(t => t.contaId === conta.id);
            const saldoConta = transacoesDaConta.reduce((acc, curr) => {
              const isEfetivado = curr.efetuado !== false;
              if (!isEfetivado) return acc;
              return curr.tipo === 'receita' ? acc + curr.valor : acc - curr.valor;
            }, parseFloat(conta.saldoInicial) || 0);

            return (
              <Card key={conta.id} className="bg-white shadow-sm border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all">
                <CardContent className="p-5 flex flex-col items-start">
                  <div className="flex justify-between items-start w-full mb-2">
                    <span className="text-sm font-semibold text-slate-600">{conta.nome}</span>
                    <button 
                      className="text-slate-300 hover:text-red-500 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if(window.confirm('Tem certeza que deseja excluir esta conta? O histórico não será perdido.')) {
                          removerConta(conta.id);
                        }
                      }}
                      title="Excluir Conta"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <h4 className={`text-xl font-bold ${saldoConta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    R$ {saldoConta.toFixed(2)}
                  </h4>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

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
        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-slate-700 flex items-center">
            <PieChart className="mr-2" size={20} />
            Orçamentos por Categoria (Mês Atual)
          </CardTitle>
          <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => setShowOrcamentoModal(true)}>
            <Plus size={14} className="mr-1" /> Nova Categoria
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {orcamentos.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-slate-200 rounded-xl text-slate-500">
              Nenhum limite definido. Adicione categorias para controlar seus gastos.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                {orcamentos.map(orc => {
                  const mesAnoStr = `${mesFiltro.getFullYear()}-${String(mesFiltro.getMonth() + 1).padStart(2, '0')}`;
                  const limiteAtual = (orc.limitesMensais && orc.limitesMensais[mesAnoStr] !== undefined) 
                    ? orc.limitesMensais[mesAnoStr] 
                    : orc.limite;

                  const gasto = gastosPorCategoria[orc.categoria] || 0;
                  const percentual = limiteAtual ? (gasto / limiteAtual) * 100 : 0;
                  const percentualLimitado = Math.min(percentual, 100);
                  
                  let barColor = 'bg-emerald-500';
                  if (percentual > 100) barColor = 'bg-rose-500';
                  else if (percentual >= 80) barColor = 'bg-amber-500';

                  let textColor = 'text-emerald-600';
                  if (percentual > 100) textColor = 'text-rose-600';
                  else if (percentual >= 80) textColor = 'text-amber-600';

                  const isEditing = orcamentoEmEdicaoObj && orcamentoEmEdicaoObj.categoria === orc.categoria;

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
          </CardContent>
        </Card>
        <ModalNovaTransacao 
          showModal={showModal}
          setShowModal={setShowModal}
          novaTransacao={novaTransacao}
          setNovaTransacao={setNovaTransacao}
          adicionarTransacao={adicionarTransacao}
          orcamentos={orcamentos}
          contas={contas}
        />

        <ModalNovaConta
          showModal={showContaModal}
          setShowModal={setShowContaModal}
          adicionarConta={adicionarConta}
        />

        <ModalNovoOrcamento
          showModal={showOrcamentoModal}
          setShowModal={setShowOrcamentoModal}
          salvarOrcamento={salvarOrcamento}
        />



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
              {transacoesFiltradas.map(transacao => {
                const isEditingTrans = transacaoEmEdicao === transacao.id;
                
                return isEditingTrans ? (
                  <div key={transacao.id} className="p-4 bg-slate-50 border-l-4 border-l-indigo-500 space-y-4 animate-in fade-in duration-200 flex flex-col">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-slate-500">Descrição</Label>
                        <Input 
                          value={editTransDesc} 
                          onChange={e => setEditTransDesc(e.target.value)} 
                          placeholder="Descrição" 
                          className="h-8 text-sm" 
                        />
                      </div>
                      <div className="space-y-1 w-full md:w-32">
                         <Label className="text-xs font-semibold text-slate-500">Valor (R$)</Label>
                         <Input 
                           type="number" 
                           step="0.01" 
                           value={editTransValor} 
                           onChange={e => setEditTransValor(e.target.value)} 
                           placeholder="0.00" 
                           className="h-8 text-sm" 
                         />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-slate-500">Categoria</Label>
                        <select 
                          className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                          value={editTransCategoria}
                          onChange={e => setEditTransCategoria(e.target.value)}
                        >
                          <option value="Sem categoria">Sem categoria</option>
                          {orcamentos.map(orc => (
                            <option key={orc.categoria} value={orc.categoria}>{orc.categoria}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-slate-500">Data</Label>
                        <Input 
                          type="date"
                          value={editTransData}
                          onChange={e => setEditTransData(e.target.value)}
                          className="h-8 text-xs px-2"
                        />
                      </div>
                      <div className="flex gap-2 items-end">
                        <Button 
                          type="button"
                          variant={editTransTipo === 'despesa' ? 'default' : 'outline'}
                          className={`flex-1 h-8 text-[10px] px-1 ${editTransTipo === 'despesa' ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}`}
                          onClick={() => setEditTransTipo('despesa')}
                        >
                          Despesa
                        </Button>
                        <Button 
                          type="button"
                          variant={editTransTipo === 'receita' ? 'default' : 'outline'}
                          className={`flex-1 h-8 text-[10px] px-1 ${editTransTipo === 'receita' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                          onClick={() => setEditTransTipo('receita')}
                        >
                          Receita
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 gap-4">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setEditTransEfetuado(!editTransEfetuado)}
                          className={`flex items-center space-x-1.5 px-2 py-1 rounded text-xs font-medium border transition-colors ${
                            editTransEfetuado 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}
                        >
                          {editTransEfetuado ? <Check size={12} /> : <Clock size={12} />}
                          <span>{editTransEfetuado ? 'Efetivado' : 'Pendente (Agendado)'}</span>
                        </button>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3" onClick={handleSalvarEdicaoTransacao}>
                          <Check size={14} className="mr-1" /> Salvar
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-slate-500 text-xs px-3" onClick={cancelarEdicaoTransacao}>
                          <X size={14} className="mr-1" /> Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    key={transacao.id} 
                    className={`p-4 flex items-center hover:bg-slate-50 transition-colors ${
                      transacao.efetuado === false 
                        ? 'bg-slate-50/40 opacity-85 border-l-4 border-l-amber-500' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4 flex-1">
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

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${transacao.tipo === 'receita' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                            </span>
                            {transacao.contaId && contas.find(c => c.id === transacao.contaId) && (
                              <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 flex items-center border border-slate-200">
                                <Wallet size={10} className="mr-1" />
                                {contas.find(c => c.id === transacao.contaId)?.nome}
                              </span>
                            )}
                          </div>
                          {transacao.efetuado === false && (
                            <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full shrink-0">
                              Agendado
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <p className={`font-medium text-xs truncate ${transacao.efetuado === false ? 'text-slate-500' : 'text-slate-800'}`}>
                            {transacao.descricao}
                          </p>
                        </div>
                        <div className="flex flex-col md:flex-row md:space-x-2 text-xs text-slate-500 mt-1">
                          <span className="bg-slate-100 px-2 py-0.5 rounded truncate max-w-[120px] text-xs">{transacao.categoria}</span>
                          <span className="block md:hidden text-xs mt-1">{new Date(transacao.data).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end shrink-0 pl-4">
                      <div className="hidden md:flex text-xs text-slate-500 mb-1 items-center">
                        <Calendar size={10} className="mr-1" /> {new Date(transacao.data).toLocaleDateString()}
                      </div>
                      <span className={`font-bold text-xs sm:text-sm ${transacao.tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600'}`} style={{ minWidth: '80px', textAlign: 'right' }}>
                        {transacao.tipo === 'receita' ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
                      </span>
                      <div className="flex items-center space-x-1 mt-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" 
                          onClick={() => iniciarEdicaoTransacao(transacao)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50" 
                          onClick={() => removerTransacao(transacao.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
  );
}
