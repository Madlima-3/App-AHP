/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Activity, Heart, Users, Target, Wallet, ChevronRight, FileText } from 'lucide-react';
import { PILARES } from './constants';
import { db } from './lib/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, setDoc, writeBatch, where, getDocs } from 'firebase/firestore';

import Dashboard from './pages/Dashboard';
import Membros from './pages/Membros';
import Metas from './pages/Metas';
import Financas from './pages/Financas';
import Relatorios from './pages/Relatorios';

export default function VolverFamiliaApp() {
  const [membros, setMembros] = useState([]);
  const [metas, setMetas] = useState([]);
  const [financas, setFinancas] = useState({ saldo: 0, transacoes: [] });
  const [orcamentos, setOrcamentos] = useState([]);

  const [novoMembro, setNovoMembro] = useState({ nome: '', papel: '' });
  const [novaMeta, setNovaMeta] = useState({ 
    titulo: '', descricao: '', pilar: 'fisico', membroId: '', prazo: ''
  });
  const [novaTransacao, setNovaTransacao] = useState({
    descricao: '', valor: '', tipo: 'despesa', categoria: 'Sem categoria', data: new Date().toISOString().split('T')[0], repeticao: 'unica', quantidadeMeses: '', efetuado: true
  });

  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [membroSelecionado, setMembroSelecionado] = useState(null);

  // Firestore Real-time Listeners
  useEffect(() => {
    // Escutar Membros
    const unsubMembros = onSnapshot(collection(db, 'membros'), (snapshot) => {
      const membrosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembros(membrosData);
    });

    // Escutar Metas
    const unsubMetas = onSnapshot(collection(db, 'metas'), (snapshot) => {
      const metasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMetas(metasData);
    });

    // Escutar Transações
    const qTransacoes = query(collection(db, 'transacoes'));
    const unsubTransacoes = onSnapshot(qTransacoes, (snapshot) => {
      const transacoesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Ordenar por data decrescente localmente para evitar necessidade de criar índice no Firestore no primeiro acesso
      transacoesData.sort((a, b) => new Date(b.data) - new Date(a.data));
      
      // Calcular saldos (Efetivado e Projetado)
      // Transações sem o campo 'efetuado' são consideradas efetivadas por padrão para compatibilidade retroativa
      const saldoEfetivado = transacoesData.reduce((acc, curr) => {
        const isEfetivado = curr.efetuado !== false;
        return curr.tipo === 'receita'
          ? (isEfetivado ? acc + curr.valor : acc)
          : (isEfetivado ? acc - curr.valor : acc);
      }, 0);

      const saldoProjetado = transacoesData.reduce((acc, curr) => {
        return curr.tipo === 'receita' ? acc + curr.valor : acc - curr.valor;
      }, 0);

      setFinancas({ 
        saldo: saldoEfetivado, 
        saldoPrevisto: saldoProjetado, 
        transacoes: transacoesData 
      });
    });

    // Escutar Orçamentos
    const unsubOrcamentos = onSnapshot(collection(db, 'orcamentos'), (snapshot) => {
      const orcamentosData = snapshot.docs.map(doc => ({ categoria: doc.id, ...doc.data() }));
      setOrcamentos(orcamentosData);
    });

    // Limpar listeners ao desmontar o componente
    return () => {
      unsubMembros();
      unsubMetas();
      unsubTransacoes();
      unsubOrcamentos();
    };
  }, []);

  const adicionarMembro = async (e) => {
    e.preventDefault();
    if (!novoMembro.nome) return;
    try {
      await addDoc(collection(db, 'membros'), novoMembro);
      setNovoMembro({ nome: '', papel: '' });
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);
    }
  };

  const removerMembro = async (id) => {
    try {
      await deleteDoc(doc(db, 'membros', id));
      if (membroSelecionado === id) setMembroSelecionado(null);
    } catch (error) {
      console.error("Erro ao remover membro:", error);
    }
  };

  const adicionarMeta = async (e) => {
    e.preventDefault();
    if (!novaMeta.titulo || !novaMeta.membroId) return;
    try {
      await addDoc(collection(db, 'metas'), { ...novaMeta, concluida: false });
      setNovaMeta({ titulo: '', descricao: '', pilar: 'fisico', membroId: '', prazo: '' });
    } catch (error) {
      console.error("Erro ao adicionar meta:", error);
    }
  };

  const alternarMetaStatus = async (id) => {
    const meta = metas.find(m => m.id === id);
    if (!meta) return;
    try {
      await updateDoc(doc(db, 'metas', id), { concluida: !meta.concluida });
    } catch (error) {
      console.error("Erro ao atualizar meta:", error);
    }
  };

  const removerMeta = async (id) => {
    try {
      await deleteDoc(doc(db, 'metas', id));
    } catch (error) {
      console.error("Erro ao remover meta:", error);
    }
  };

  const adicionarTransacao = async (e) => {
    e.preventDefault();
    if (!novaTransacao.descricao || !novaTransacao.valor) return;

    const valorNum = parseFloat(novaTransacao.valor);
    const repeticao = novaTransacao.repeticao || 'unica';
    let qtdMeses = parseInt(novaTransacao.quantidadeMeses) || 1;
    if (repeticao === 'unica') qtdMeses = 1;

    // Se não especificado, efetuado padrão é true
    const efetuadoInicial = novaTransacao.efetuado !== false;

    try {
      const batch = writeBatch(db);
      
      const valorPorMes = repeticao === 'parcelada' ? (valorNum / qtdMeses) : valorNum;

      for (let i = 0; i < qtdMeses; i++) {
        const dataOriginal = new Date(novaTransacao.data + 'T12:00:00');
        dataOriginal.setMonth(dataOriginal.getMonth() + i);
        const dataFormatada = dataOriginal.toISOString().split('T')[0];

        let descFinal = novaTransacao.descricao;
        if (repeticao === 'parcelada') {
          descFinal = `${novaTransacao.descricao} (${i + 1}/${qtdMeses})`;
        }

        // A primeira parcela/mês atual segue a escolha do usuário.
        // As parcelas ou repetições futuras (i > 0) por padrão começam como não efetuadas.
        const transacaoEfetuada = i === 0 ? efetuadoInicial : false;

        const novaRef = doc(collection(db, 'transacoes'));
        batch.set(novaRef, {
          descricao: descFinal,
          valor: valorPorMes,
          tipo: novaTransacao.tipo,
          categoria: novaTransacao.categoria,
          data: dataFormatada,
          efetuado: transacaoEfetuada
        });
      }

      await batch.commit();

      setNovaTransacao({
        descricao: '',
        valor: '',
        tipo: 'despesa',
        categoria: 'Sem categoria',
        data: new Date().toISOString().split('T')[0],
        repeticao: 'unica',
        quantidadeMeses: '',
        efetuado: true
      });
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
    }
  };

  const removerTransacao = async (id) => {
    try {
      await deleteDoc(doc(db, 'transacoes', id));
    } catch (error) {
      console.error("Erro ao remover transação:", error);
    }
  };

  const alternarTransacaoStatus = async (id) => {
    const transacao = financas.transacoes.find(t => t.id === id);
    if (!transacao) return;
    try {
      await updateDoc(doc(db, 'transacoes', id), { 
        efetuado: transacao.efetuado === undefined ? false : !transacao.efetuado 
      });
    } catch (error) {
      console.error("Erro ao alternar status da transação:", error);
    }
  };

  const editarTransacao = async (id, dadosAtualizados) => {
    try {
      await updateDoc(doc(db, 'transacoes', id), {
        ...dadosAtualizados,
        valor: parseFloat(dadosAtualizados.valor)
      });
    } catch (error) {
      console.error("Erro ao editar transação:", error);
    }
  };

  const salvarOrcamento = async (categoria, limite) => {
    try {
      await setDoc(doc(db, 'orcamentos', categoria), { 
        limite: parseFloat(limite),
        limitesMensais: {}
      });
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error);
    }
  };

  const editarOrcamento = async (orcamentoAntigo, categoriaNova, novoLimitePadrao, novoLimiteMensal, mesAnoFiltro) => {
    try {
      const batch = writeBatch(db);
      const docAntigoRef = doc(db, 'orcamentos', orcamentoAntigo.categoria);
      const docNovoRef = doc(db, 'orcamentos', categoriaNova);
      
      let limitesMensaisUpdate = orcamentoAntigo.limitesMensais || {};

      // Travamento de histórico se o padrão mudou
      if (parseFloat(novoLimitePadrao) !== orcamentoAntigo.limite) {
        // Encontrar o mês mais antigo
        let mesMaisAntigo = mesAnoFiltro;
        financas.transacoes.forEach(t => {
          const tMesAno = t.data.substring(0, 7); // YYYY-MM
          if (tMesAno < mesMaisAntigo) {
            mesMaisAntigo = tMesAno;
          }
        });

        // Preencher os meses do passado que não têm exceção
        let atual = new Date(mesMaisAntigo + '-02T00:00:00'); // Dia 02 para evitar fuso horário puxando mês anterior
        const limiteFiltro = new Date(mesAnoFiltro + '-02T00:00:00');
        
        while (atual < limiteFiltro) {
          const m = atual.toISOString().substring(0, 7);
          if (limitesMensaisUpdate[m] === undefined) {
            limitesMensaisUpdate[m] = orcamentoAntigo.limite;
          }
          atual.setMonth(atual.getMonth() + 1);
        }
      }

      // Atualizar o limite do mês atual, se fornecido
      if (novoLimiteMensal !== '') {
        limitesMensaisUpdate[mesAnoFiltro] = parseFloat(novoLimiteMensal);
      } else {
        // Se vazio, removemos a exceção para voltar ao padrão
        delete limitesMensaisUpdate[mesAnoFiltro];
      }

      const novosDados = {
        limite: parseFloat(novoLimitePadrao),
        limitesMensais: limitesMensaisUpdate
      };

      if (orcamentoAntigo.categoria !== categoriaNova) {
        batch.set(docNovoRef, novosDados);
        batch.delete(docAntigoRef);
        
        // Atualizar transações
        const q = query(collection(db, 'transacoes'), where('categoria', '==', orcamentoAntigo.categoria));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((documento) => {
          batch.update(documento.ref, { categoria: categoriaNova });
        });
      } else {
        batch.update(docAntigoRef, novosDados);
      }
      
      await batch.commit();
    } catch (error) {
      console.error("Erro ao editar orçamento:", error);
    }
  };

  const removerOrcamento = async (categoria) => {
    try {
      await deleteDoc(doc(db, 'orcamentos', categoria));
    } catch (error) {
      console.error("Erro ao remover orçamento:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-indigo-700 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white text-indigo-700 p-1.5 rounded-lg">
                <Heart size={24} className="fill-indigo-700" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Volver Família</h1>
            </div>
            <div className="hidden md:flex space-x-1 text-xs font-medium">
              {PILARES.map(pilar => (
                <span key={pilar.id} className="px-2 py-1 rounded bg-indigo-600 flex items-center">
                  <pilar.icon size={12} className="mr-1" /> {pilar.nome}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex flex-col md:flex-row gap-8 pb-24 md:pb-8">
        
        {/* Sidebar Navigation */}
        <aside className="hidden md:block w-64 shrink-0">
          <nav className="space-y-2 sticky top-24">
            <button 
              onClick={() => { setAbaAtiva('dashboard'); setMembroSelecionado(null); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${abaAtiva === 'dashboard' ? 'bg-indigo-100 text-indigo-700 font-semibold shadow-sm' : 'hover:bg-slate-200 text-slate-600'}`}
            >
              <div className="flex items-center"><Activity className="mr-3" size={20} /> Visão Geral</div>
              {abaAtiva === 'dashboard' && <ChevronRight size={16} />}
            </button>
            <button 
              onClick={() => setAbaAtiva('membros')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${abaAtiva === 'membros' ? 'bg-indigo-100 text-indigo-700 font-semibold shadow-sm' : 'hover:bg-slate-200 text-slate-600'}`}
            >
              <div className="flex items-center"><Users className="mr-3" size={20} /> Membros</div>
              {abaAtiva === 'membros' && <ChevronRight size={16} />}
            </button>
            <button 
              onClick={() => { setAbaAtiva('metas'); setMembroSelecionado(null); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${abaAtiva === 'metas' ? 'bg-indigo-100 text-indigo-700 font-semibold shadow-sm' : 'hover:bg-slate-200 text-slate-600'}`}
            >
              <div className="flex items-center"><Target className="mr-3" size={20} /> Metas e Ações</div>
              {abaAtiva === 'metas' && <ChevronRight size={16} />}
            </button>
            <button 
              onClick={() => setAbaAtiva('financas')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${abaAtiva === 'financas' ? 'bg-emerald-100 text-emerald-800 font-semibold shadow-sm' : 'hover:bg-slate-200 text-slate-600'}`}
            >
              <div className="flex items-center"><Wallet className="mr-3" size={20} /> Paz Financeira</div>
              {abaAtiva === 'financas' && <ChevronRight size={16} />}
            </button>
            <button 
              onClick={() => setAbaAtiva('relatorios')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${abaAtiva === 'relatorios' ? 'bg-indigo-100 text-indigo-700 font-semibold shadow-sm' : 'hover:bg-slate-200 text-slate-600'}`}
            >
              <div className="flex items-center"><FileText className="mr-3" size={20} /> Relatórios</div>
              {abaAtiva === 'relatorios' && <ChevronRight size={16} />}
            </button>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Filtrar Metas</h3>
              <ul className="space-y-1">
                {membros.map(m => (
                   <li key={m.id}>
                     <button 
                        onClick={() => { setMembroSelecionado(m.id); setAbaAtiva('metas'); }}
                        className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${membroSelecionado === m.id && abaAtiva === 'metas' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
                     >
                       <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs mr-3 font-bold">
                         {m.nome.charAt(0)}
                       </div>
                       {m.nome}
                     </button>
                   </li>
                ))}
              </ul>
            </div>
          </nav>
        </aside>

        {/* Dynamic Content */}
        <main className="flex-1 w-full min-w-0">
          {abaAtiva === 'dashboard' && (
            <Dashboard 
              metas={metas} 
              membros={membros} 
              financas={financas} 
              alternarMetaStatus={alternarMetaStatus} 
              setAbaAtiva={setAbaAtiva} 
            />
          )}
          {abaAtiva === 'membros' && (
            <Membros 
              membros={membros} 
              novoMembro={novoMembro} 
              setNovoMembro={setNovoMembro} 
              adicionarMembro={adicionarMembro} 
              removerMembro={removerMembro} 
              setMembroSelecionado={setMembroSelecionado} 
              setAbaAtiva={setAbaAtiva} 
            />
          )}
          {abaAtiva === 'metas' && (
            <Metas 
              metas={metas} 
              membros={membros} 
              novaMeta={novaMeta} 
              setNovaMeta={setNovaMeta} 
              adicionarMeta={adicionarMeta} 
              alternarMetaStatus={alternarMetaStatus} 
              removerMeta={removerMeta} 
              membroSelecionado={membroSelecionado} 
              setMembroSelecionado={setMembroSelecionado} 
            />
          )}
          {abaAtiva === 'financas' && (
            <Financas 
              financas={financas} 
              novaTransacao={novaTransacao} 
              setNovaTransacao={setNovaTransacao} 
              adicionarTransacao={adicionarTransacao} 
              removerTransacao={removerTransacao} 
              orcamentos={orcamentos}
              salvarOrcamento={salvarOrcamento}
              editarOrcamento={editarOrcamento}
              removerOrcamento={removerOrcamento}
              alternarTransacaoStatus={alternarTransacaoStatus}
              editarTransacao={editarTransacao}
            />
          )}
          {abaAtiva === 'relatorios' && (
            <Relatorios 
              financas={financas} 
              orcamentos={orcamentos}
              alternarTransacaoStatus={alternarTransacaoStatus}
              removerTransacao={removerTransacao}
            />
          )}
        </main>

      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center p-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => { setAbaAtiva('dashboard'); setMembroSelecionado(null); }} 
          className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${abaAtiva === 'dashboard' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Activity size={24} className="mb-1" />
          <span className="text-[10px] font-medium">Painel</span>
        </button>
        <button 
          onClick={() => setAbaAtiva('membros')} 
          className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${abaAtiva === 'membros' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Users size={24} className="mb-1" />
          <span className="text-[10px] font-medium">Família</span>
        </button>
        <button 
          onClick={() => { setAbaAtiva('metas'); setMembroSelecionado(null); }} 
          className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${abaAtiva === 'metas' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Target size={24} className="mb-1" />
          <span className="text-[10px] font-medium">Metas</span>
        </button>
        <button 
          onClick={() => setAbaAtiva('financas')} 
          className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${abaAtiva === 'financas' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Wallet size={24} className="mb-1" />
          <span className="text-[10px] font-medium">Finanças</span>
        </button>
        <button 
          onClick={() => setAbaAtiva('relatorios')} 
          className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${abaAtiva === 'relatorios' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <FileText size={24} className="mb-1" />
          <span className="text-[10px] font-medium">Relatórios</span>
        </button>
      </nav>
    </div>
  );
}