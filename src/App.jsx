/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Activity, Heart, Users, Target, Wallet, ChevronRight, FileText } from 'lucide-react';
import { PILARES } from './constants';
import { db } from './lib/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, setDoc, writeBatch, where, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';

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
  const [contas, setContas] = useState([]);

  const [novoMembro, setNovoMembro] = useState({ nome: '', papel: '' });
  const [novaMeta, setNovaMeta] = useState({
    titulo: '', descricao: '', pilar: 'fisico', membroId: '', prazo: '',
    tipo: 'marco', alvo: '', unidade: '', periodo: 'semanal'
  });
  const [novaTransacao, setNovaTransacao] = useState({
    descricao: '', valor: '', tipo: 'despesa', categoria: 'Sem categoria', data: new Date().toISOString().split('T')[0], repeticao: 'unica', quantidadeMeses: '', efetuado: true, contaId: ''
  });

  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [membroSelecionado, setMembroSelecionado] = useState(null);

  // Firestore Real-time Listeners
  useEffect(() => {
    const unsubMembros = onSnapshot(collection(db, 'membros'), (snapshot) => {
      const membrosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembros(membrosData);
    });

    const unsubMetas = onSnapshot(collection(db, 'metas'), (snapshot) => {
      const metasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMetas(metasData);
    });

    const qTransacoes = query(collection(db, 'transacoes'));
    const unsubTransacoes = onSnapshot(qTransacoes, (snapshot) => {
      const transacoesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      transacoesData.sort((a, b) => new Date(b.data) - new Date(a.data));

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

    const unsubOrcamentos = onSnapshot(collection(db, 'orcamentos'), (snapshot) => {
      const orcamentosData = snapshot.docs.map(doc => ({ categoria: doc.id, ...doc.data() }));
      setOrcamentos(orcamentosData);
    });

    const unsubContas = onSnapshot(collection(db, 'contas'), (snapshot) => {
      const contasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContas(contasData);
    });

    return () => {
      unsubMembros();
      unsubMetas();
      unsubTransacoes();
      unsubOrcamentos();
      unsubContas();
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
      await addDoc(collection(db, 'metas'), {
        titulo: novaMeta.titulo,
        descricao: novaMeta.descricao,
        pilar: novaMeta.pilar,
        membroId: novaMeta.membroId,
        prazo: novaMeta.prazo,
        tipo: novaMeta.tipo || 'marco',
        alvo: novaMeta.alvo ? Number(novaMeta.alvo) : null,
        unidade: novaMeta.unidade || null,
        periodo: novaMeta.periodo || null,
        historico: [],
        concluida: false,
      });
      setNovaMeta({ titulo: '', descricao: '', pilar: 'fisico', membroId: '', prazo: '', tipo: 'marco', alvo: '', unidade: '', periodo: 'semanal' });
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

  const adicionarCheckin = async (metaId, valor = 1, dataStr = null) => {
    const entrada = {
      data: dataStr || new Date().toISOString().split('T')[0],
      valor,
      ts: Date.now(),
    };
    try {
      await updateDoc(doc(db, 'metas', metaId), { historico: arrayUnion(entrada) });
    } catch (error) {
      console.error("Erro ao adicionar check-in:", error);
    }
  };

  const removerCheckin = async (metaId, entradaExistente) => {
    try {
      await updateDoc(doc(db, 'metas', metaId), { historico: arrayRemove(entradaExistente) });
    } catch (error) {
      console.error("Erro ao remover check-in:", error);
    }
  };

  const adicionarConta = async (nome, saldoInicial) => {
    try {
      await addDoc(collection(db, 'contas'), { nome, saldoInicial: parseFloat(saldoInicial) || 0 });
    } catch (error) {
      console.error("Erro ao adicionar conta:", error);
    }
  };

  const removerConta = async (id) => {
    try {
      await deleteDoc(doc(db, 'contas', id));
    } catch (error) {
      console.error("Erro ao remover conta:", error);
    }
  };

  const editarConta = async (id, nome, saldoInicial) => {
    try {
      await updateDoc(doc(db, 'contas', id), { nome, saldoInicial: parseFloat(saldoInicial) || 0 });
    } catch (error) {
      console.error("Erro ao editar conta:", error);
    }
  };

  const adicionarTransacao = async (e) => {
    e.preventDefault();
    if (!novaTransacao.descricao || !novaTransacao.valor) return;

    const valorNum = parseFloat(novaTransacao.valor);
    const repeticao = novaTransacao.repeticao || 'unica';
    let qtdMeses = parseInt(novaTransacao.quantidadeMeses) || 1;
    if (repeticao === 'unica') qtdMeses = 1;

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

        const transacaoEfetuada = i === 0 ? efetuadoInicial : false;

        const novaRef = doc(collection(db, 'transacoes'));
        batch.set(novaRef, {
          descricao: descFinal,
          valor: valorPorMes,
          tipo: novaTransacao.tipo,
          categoria: novaTransacao.categoria,
          data: dataFormatada,
          efetuado: transacaoEfetuada,
          contaId: novaTransacao.contaId || ''
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
        efetuado: true,
        contaId: novaTransacao.contaId || ''
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

      if (parseFloat(novoLimitePadrao) !== orcamentoAntigo.limite) {
        let mesMaisAntigo = mesAnoFiltro;
        financas.transacoes.forEach(t => {
          const tMesAno = t.data.substring(0, 7);
          if (tMesAno < mesMaisAntigo) mesMaisAntigo = tMesAno;
        });

        let atual = new Date(mesMaisAntigo + '-02T00:00:00');
        const limiteFiltro = new Date(mesAnoFiltro + '-02T00:00:00');

        while (atual < limiteFiltro) {
          const m = atual.toISOString().substring(0, 7);
          if (limitesMensaisUpdate[m] === undefined) {
            limitesMensaisUpdate[m] = orcamentoAntigo.limite;
          }
          atual.setMonth(atual.getMonth() + 1);
        }
      }

      if (novoLimiteMensal !== '') {
        limitesMensaisUpdate[mesAnoFiltro] = parseFloat(novoLimiteMensal);
      } else {
        delete limitesMensaisUpdate[mesAnoFiltro];
      }

      const novosDados = {
        limite: parseFloat(novoLimitePadrao),
        limitesMensais: limitesMensaisUpdate
      };

      if (orcamentoAntigo.categoria !== categoriaNova) {
        batch.set(docNovoRef, novosDados);
        batch.delete(docAntigoRef);
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
    <div className="min-h-screen bg-bgray font-sans text-slate-900">
      {/* Header */}
      <header className="bg-vblue text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white text-vblue p-1.5 rounded-lg">
                <Heart size={24} className="fill-vblue" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Volver Família</h1>
            </div>
            <div className="hidden lg:flex space-x-1 text-xs font-medium">
              {PILARES.map(pilar => (
                <span key={pilar.id} className="px-2 py-1 rounded bg-vblue-700 flex items-center">
                  <pilar.icon size={12} className="mr-1" /> {pilar.nome}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex flex-col lg:flex-row gap-8 pb-24 lg:pb-8">

        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0">
          <nav className="space-y-2 sticky top-24">
            <button
              onClick={() => { setAbaAtiva('dashboard'); setMembroSelecionado(null); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${abaAtiva === 'dashboard' ? 'bg-vblue-100 text-vblue font-semibold shadow-sm' : 'hover:bg-bgray-50 text-slate-600'}`}
            >
              <div className="flex items-center"><Activity className="mr-3" size={20} /> Visão Geral</div>
              {abaAtiva === 'dashboard' && <ChevronRight size={16} />}
            </button>
            <button
              onClick={() => setAbaAtiva('membros')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${abaAtiva === 'membros' ? 'bg-vblue-100 text-vblue font-semibold shadow-sm' : 'hover:bg-bgray-50 text-slate-600'}`}
            >
              <div className="flex items-center"><Users className="mr-3" size={20} /> Membros</div>
              {abaAtiva === 'membros' && <ChevronRight size={16} />}
            </button>
            <button
              onClick={() => { setAbaAtiva('metas'); setMembroSelecionado(null); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${abaAtiva === 'metas' ? 'bg-vblue-100 text-vblue font-semibold shadow-sm' : 'hover:bg-bgray-50 text-slate-600'}`}
            >
              <div className="flex items-center"><Target className="mr-3" size={20} /> Metas e Ações</div>
              {abaAtiva === 'metas' && <ChevronRight size={16} />}
            </button>
            <button
              onClick={() => setAbaAtiva('financas')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${abaAtiva === 'financas' ? 'bg-vblue-100 text-vblue font-semibold shadow-sm' : 'hover:bg-bgray-50 text-slate-600'}`}
            >
              <div className="flex items-center"><Wallet className="mr-3" size={20} /> Paz Financeira</div>
              {abaAtiva === 'financas' && <ChevronRight size={16} />}
            </button>
            <button
              onClick={() => setAbaAtiva('relatorios')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${abaAtiva === 'relatorios' ? 'bg-vblue-100 text-vblue font-semibold shadow-sm' : 'hover:bg-bgray-50 text-slate-600'}`}
            >
              <div className="flex items-center"><FileText className="mr-3" size={20} /> Relatórios</div>
              {abaAtiva === 'relatorios' && <ChevronRight size={16} />}
            </button>

            <div className="mt-8 pt-6 border-t border-bgray-50">
              <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Filtrar Metas</h3>
              <ul className="space-y-1">
                {membros.map(m => (
                   <li key={m.id}>
                     <button
                        onClick={() => { setMembroSelecionado(m.id); setAbaAtiva('metas'); }}
                        className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${membroSelecionado === m.id && abaAtiva === 'metas' ? 'bg-vblue-50 text-vblue font-medium' : 'text-slate-600 hover:bg-bgray-50'}`}
                     >
                       <div className="w-6 h-6 rounded-full bg-bgray flex items-center justify-center text-xs mr-3 font-bold text-slate-600">
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
              adicionarCheckin={adicionarCheckin}
              removerCheckin={removerCheckin}
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
              adicionarCheckin={adicionarCheckin}
              removerCheckin={removerCheckin}
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
              contas={contas}
              adicionarConta={adicionarConta}
              removerConta={removerConta}
              editarConta={editarConta}
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-bgray flex justify-around items-center p-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => { setAbaAtiva('dashboard'); setMembroSelecionado(null); }}
          className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${abaAtiva === 'dashboard' ? 'text-vblue' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Activity size={24} className="mb-1" />
          <span className="text-[10px] font-medium">Painel</span>
        </button>
        <button
          onClick={() => setAbaAtiva('membros')}
          className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${abaAtiva === 'membros' ? 'text-vblue' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Users size={24} className="mb-1" />
          <span className="text-[10px] font-medium">Família</span>
        </button>
        <button
          onClick={() => { setAbaAtiva('metas'); setMembroSelecionado(null); }}
          className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${abaAtiva === 'metas' ? 'text-vblue' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Target size={24} className="mb-1" />
          <span className="text-[10px] font-medium">Metas</span>
        </button>
        <button
          onClick={() => setAbaAtiva('financas')}
          className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${abaAtiva === 'financas' ? 'text-vblue' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Wallet size={24} className="mb-1" />
          <span className="text-[10px] font-medium">Finanças</span>
        </button>
        <button
          onClick={() => setAbaAtiva('relatorios')}
          className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${abaAtiva === 'relatorios' ? 'text-vblue' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <FileText size={24} className="mb-1" />
          <span className="text-[10px] font-medium">Relatórios</span>
        </button>
      </nav>
    </div>
  );
}
