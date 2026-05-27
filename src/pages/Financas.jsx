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
  removerConta,
  editarConta
}) {
  const [contaEmEdicao, setContaEmEdicao] = useState(null);
  const [editContaNome, setEditContaNome] = useState('');
  const [editContaSaldo, setEditContaSaldo] = useState('');

  const iniciarEdicaoConta = (conta) => {
    setContaEmEdicao(conta.id);
    setEditContaNome(conta.nome);
    setEditContaSaldo(conta.saldoInicial);
  };

  const cancelarEdicaoConta = () => {
    setContaEmEdicao(null);
    setEditContaNome('');
    setEditContaSaldo('');
  };

  const handleSalvarEdicaoConta = (e) => {
    e.preventDefault();
    if (!editContaNome) return;
    editarConta(contaEmEdicao, editContaNome, editContaSaldo);
    cancelarEdicaoConta();
  };

  const [orcamentoEmEdicaoObj, setOrcamentoEmEdicaoObj] = useState(null);
  const [editCategoria, setEditCategoria] = useState('');
  const [editLimitePadrao, setEditLimitePadrao] = useState('');
  const [editLimiteMensal, setEditLimiteMensal] = useState('');

  const [mesFiltro, setMesFiltro] = useState(new Date());

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

  const transacoesFiltradas = financas.transacoes.filter(t => {
    const [ano, mes] = t.data.split('-');
    return parseInt(ano) === mesFiltro.getFullYear() && parseInt(mes) === mesFiltro.getMonth() + 1;
  });

  const receitasTotais = transacoesFiltradas.filter(t => t.tipo === 'receita').reduce((acc, curr) => acc + curr.valor, 0);
  const receitasEfetivadas = transacoesFiltradas.filter(t => t.tipo === 'receita' && t.efetuado !== false).reduce((acc, curr) => acc + curr.valor, 0);

  const despesasTotais = transacoesFiltradas.filter(t => t.tipo === 'despesa').reduce((acc, curr) => acc + curr.valor, 0);
  const despesasEfetivadas = transacoesFiltradas.filter(t => t.tipo === 'despesa' && t.efetuado !== false).reduce((acc, curr) => acc + curr.valor, 0);

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
          <Calendar className="mr-2 text-vblue" size={24} />
          Visão Mensal
        </h2>
        <div className="flex items-center space-x-4 bg-bgray-100 px-2 py-1 rounded-lg border border-bgray">
          <Button variant="ghost" size="icon" onClick={mesAnterior} className="hover:bg-bgray text-slate-600">
            <ChevronLeft size={20} />
          </Button>
          <span className="font-semibold text-slate-700 min-w-[140px] text-center">
            {nomeMesCapitalizado}
          </span>
          <Button variant="ghost" size="icon" onClick={proximoMes} className="hover:bg-bgray text-slate-600">
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-vblue-800 text-white shadow-sm border-vblue-700 min-h-[110px]">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <div className="flex justify-between items-center w-full">
              <div>
                <p className="text-sm font-medium text-vblue-100 mb-1">Saldo Real (Efetivado)</p>
                <h3 className="text-3xl font-bold">R$ {financas.saldo.toFixed(2)}</h3>
                <p className="text-xs text-vblue-100 mt-1">
                  Projetado: R$ {(financas.saldoPrevisto ?? financas.saldo).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-vblue-700 rounded-lg shrink-0 ml-2">
                <Wallet size={24} className="text-vblue-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-vblue-100 min-h-[110px]">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <div className="flex justify-between items-center w-full">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Receitas (Efetivadas)</p>
                <h3 className="text-2xl font-bold text-vblue">R$ {receitasEfetivadas.toFixed(2)}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Total planejado: R$ {receitasTotais.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-vblue-50 rounded-lg shrink-0 ml-2">
                <ArrowUpRight size={24} className="text-vblue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-vcoral-100 min-h-[110px]">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <div className="flex justify-between items-center w-full">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Despesas (Efetivadas)</p>
                <h3 className="text-2xl font-bold text-vcoral">R$ {despesasEfetivadas.toFixed(2)}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Total planejado: R$ {despesasTotais.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-vcoral-50 rounded-lg shrink-0 ml-2">
                <ArrowDownRight size={24} className="text-vcoral" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Minhas Contas */}
      <Card className="shadow-sm border-slate-200 mb-8">
        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-slate-700 flex items-center">
            <Wallet className="mr-2" size={20} /> Minhas Contas
          </CardTitle>
          <Button className="h-10 w-48 text-sm font-medium bg-vblue hover:bg-vblue-700 text-white rounded-md flex items-center justify-center transition-colors" onClick={() => setShowContaModal(true)}>
            <Plus size={14} className="mr-1 shrink-0" /> <span className="truncate">Nova Conta</span>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {contas.length === 0 && (
            <div className="col-span-full p-4 border border-dashed border-bgray rounded-xl text-center text-slate-500 text-sm">
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
              <Card key={conta.id} className="bg-white shadow-sm border-slate-200 hover:border-vblue-100 hover:shadow-md transition-all">
                <CardContent className="p-5 flex flex-col items-start w-full">
                  {contaEmEdicao === conta.id ? (
                    <div className="w-full space-y-3 animate-in fade-in duration-200">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-slate-500">Nome da Conta</Label>
                        <Input
                          value={editContaNome}
                          onChange={e => setEditContaNome(e.target.value)}
                          placeholder="Nome"
                          className="h-8 text-sm"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-slate-500">Saldo Inicial (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editContaSaldo}
                          onChange={e => setEditContaSaldo(e.target.value)}
                          placeholder="0.00"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex space-x-2 pt-1 justify-end">
                        <Button size="icon" variant="outline" className="h-7 w-7 text-slate-500" onClick={cancelarEdicaoConta}>
                          <X size={14} />
                        </Button>
                        <Button size="icon" className="h-7 w-7 bg-vblue hover:bg-vblue-700 text-white" onClick={handleSalvarEdicaoConta}>
                          <Check size={14} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start w-full mb-2 group">
                        <span className="text-sm font-semibold text-slate-600 truncate mr-2">{conta.nome}</span>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="text-slate-300 hover:text-vblue transition-colors p-1"
                            onClick={(e) => { e.stopPropagation(); iniciarEdicaoConta(conta); }}
                            title="Editar Conta"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="text-slate-300 hover:text-vcoral transition-colors p-1"
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
                      </div>
                      <h4 className={`text-xl font-bold ${saldoConta >= 0 ? 'text-vblue' : 'text-vcoral'}`}>
                        R$ {saldoConta.toFixed(2)}
                      </h4>
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
          </div>
        </CardContent>
      </Card>

      {/* Teto de Gastos / Orçamentos */}
      <Card className="shadow-sm border-slate-200 mb-8">
        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-slate-700 flex items-center">
            <PieChart className="mr-2" size={20} />
            Orçamentos por Categoria (Mês Atual)
          </CardTitle>
          <Button className="h-10 w-48 text-sm font-medium bg-vblue hover:bg-vblue-700 text-white rounded-md flex items-center justify-center transition-colors" onClick={() => setShowOrcamentoModal(true)}>
            <Plus size={14} className="mr-1 shrink-0" /> <span className="truncate">Nova Categoria</span>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {orcamentos.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-bgray rounded-xl text-slate-500">
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

                  let barColor = 'bg-vblue';
                  if (percentual > 100) barColor = 'bg-vcoral';
                  else if (percentual >= 80) barColor = 'bg-vyellow';

                  let textColor = 'text-vblue';
                  if (percentual > 100) textColor = 'text-vcoral';
                  else if (percentual >= 80) textColor = 'text-vyellow-700';

                  const isEditing = orcamentoEmEdicaoObj && orcamentoEmEdicaoObj.categoria === orc.categoria;

                  return (
                    <div key={orc.categoria} className="bg-bgray-100 p-4 rounded-xl border border-bgray group relative">
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
                               <Label className="text-[10px] text-vblue font-semibold">Exceção deste Mês</Label>
                               <Input
                                 type="number"
                                 step="0.01"
                                 value={editLimiteMensal}
                                 onChange={e => setEditLimiteMensal(e.target.value)}
                                 placeholder="Mês atual"
                                 className="h-8 text-sm w-full border-vblue-100 focus-visible:ring-vblue"
                               />
                             </div>
                             <div className="flex space-x-1 pb-0.5">
                               <Button size="icon" className="h-8 w-8 bg-vblue hover:bg-vblue-700 text-white" onClick={handleSalvarEdicao}>
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
                                <span className="ml-2 text-[10px] bg-vblue-100 text-vblue px-1.5 py-0.5 rounded font-medium">Exceção do Mês</span>
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
                              className="h-6 w-6 text-slate-400 hover:text-vblue"
                              onClick={() => iniciarEdicao(orc)}
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-300 hover:text-vcoral"
                              onClick={() => removerOrcamento(orc.categoria)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="w-full bg-bgray rounded-full h-2.5 overflow-hidden mt-1">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${percentualLimitado}%` }}
                        ></div>
                      </div>
                      {percentual > 100 && !isEditing && (
                        <p className="text-xs text-vcoral mt-1 font-medium text-right">
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
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-slate-700 flex items-center">
              <TrendingUp className="mr-2" size={20} />
              Histórico do Mês
            </CardTitle>
            <Button className="h-10 w-48 text-sm font-medium bg-vblue hover:bg-vblue-700 text-white rounded-md flex items-center justify-center transition-colors" onClick={() => setShowModal(true)}>
              <Plus size={14} className="mr-1 shrink-0" /> <span className="truncate">Novo Lançamento</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {transacoesFiltradas.map(transacao => {
                const isEditingTrans = transacaoEmEdicao === transacao.id;

                return isEditingTrans ? (
                  <div key={transacao.id} className="p-4 bg-bgray-100 border-l-4 border-l-vblue space-y-4 animate-in fade-in duration-200 flex flex-col">
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
                          className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vblue"
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
                          className={`flex-1 h-8 text-[10px] px-1 ${editTransTipo === 'despesa' ? 'bg-vcoral hover:bg-vcoral-700 text-white' : ''}`}
                          onClick={() => setEditTransTipo('despesa')}
                        >
                          Despesa
                        </Button>
                        <Button
                          type="button"
                          variant={editTransTipo === 'receita' ? 'default' : 'outline'}
                          className={`flex-1 h-8 text-[10px] px-1 ${editTransTipo === 'receita' ? 'bg-vblue hover:bg-vblue-700 text-white' : ''}`}
                          onClick={() => setEditTransTipo('receita')}
                        >
                          Receita
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-bgray gap-4">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setEditTransEfetuado(!editTransEfetuado)}
                          className={`flex items-center space-x-1.5 px-2 py-1 rounded text-xs font-medium border transition-colors ${
                            editTransEfetuado
                              ? 'bg-vblue-50 border-vblue-100 text-vblue'
                              : 'bg-vyellow-50 border-vyellow-100 text-vyellow-800'
                          }`}
                        >
                          {editTransEfetuado ? <Check size={12} /> : <Clock size={12} />}
                          <span>{editTransEfetuado ? 'Efetivado' : 'Pendente (Agendado)'}</span>
                        </button>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" className="h-8 bg-vblue hover:bg-vblue-700 text-white text-xs px-3" onClick={handleSalvarEdicaoTransacao}>
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
                    className={`p-4 flex items-center hover:bg-bgray-100 transition-colors ${
                      transacao.efetuado === false
                        ? 'bg-vyellow-50/40 opacity-85 border-l-4 border-l-vyellow'
                        : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <button
                        onClick={() => alternarTransacaoStatus(transacao.id)}
                        className={`p-2 rounded-full transition-all relative group cursor-pointer ${
                          transacao.efetuado === false
                            ? 'bg-vyellow-100 text-vyellow-800 hover:bg-vblue-100 hover:text-vblue'
                            : transacao.tipo === 'receita'
                              ? 'bg-vblue-100 text-vblue hover:bg-vyellow-100 hover:text-vyellow-800'
                              : 'bg-vcoral-100 text-vcoral hover:bg-vyellow-100 hover:text-vyellow-800'
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
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${transacao.tipo === 'receita' ? 'bg-vblue-100 text-vblue' : 'bg-vcoral-100 text-vcoral'}`}>
                              {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                            </span>
                            {transacao.contaId && contas.find(c => c.id === transacao.contaId) && (
                              <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-bgray-100 text-slate-600 flex items-center border border-bgray">
                                <Wallet size={10} className="mr-1" />
                                {contas.find(c => c.id === transacao.contaId)?.nome}
                              </span>
                            )}
                          </div>
                          {transacao.efetuado === false && (
                            <span className="text-[10px] font-semibold bg-vyellow-100 text-vyellow-800 px-1.5 py-0.5 rounded-full shrink-0">
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
                          <span className="bg-bgray-100 px-2 py-0.5 rounded truncate max-w-[120px] text-xs">{transacao.categoria}</span>
                          <span className="block md:hidden text-xs mt-1">{new Date(transacao.data).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 pl-4">
                      <div className="hidden md:flex text-xs text-slate-500 mb-1 items-center">
                        <Calendar size={10} className="mr-1" /> {new Date(transacao.data).toLocaleDateString()}
                      </div>
                      <span className={`font-bold text-xs sm:text-sm ${transacao.tipo === 'receita' ? 'text-vblue' : 'text-vcoral'}`} style={{ minWidth: '80px', textAlign: 'right' }}>
                        {transacao.tipo === 'receita' ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
                      </span>
                      <div className="flex items-center space-x-1 mt-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-vblue hover:bg-vblue-50"
                          onClick={() => iniciarEdicaoTransacao(transacao)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-300 hover:text-vcoral hover:bg-vcoral-50"
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
