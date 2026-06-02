export interface TipoAtivo {
  id: string;
  nome: string;
  descricao?: string | null;
  maxPatologiasEsperadas: number;
  pesoRelativoFuturo?: number | null;
  criadoEm: Date;
  atualizadoEm: Date;
  versoes?: VersaoConfiguracao[];
}

export type StatusVersao = "rascunho" | "ativa" | "arquivada";
export type TipoMatriz = "ativo" | "patologia";

export interface VersaoConfiguracao {
  id: string;
  tipoAtivoId: string;
  versao: number;
  status: StatusVersao;
  notas?: string | null;
  criadoEm: Date;
  tipoAtivo?: TipoAtivo;
  criteriosAtivo?: CriterioAtivo[];
  criteriosPatologia?: CriterioPatologia[];
  matrizes?: MatrizAHP[];
}

export interface CriterioAtivo {
  id: string;
  versaoConfiguracaoId: string;
  nome: string;
  descricao?: string | null;
  peso?: number | null;
  ordem: number;
  escalas?: EscalaCriterioAtivo[];
}

export interface EscalaCriterioAtivo {
  id: string;
  criterioAtivoId: string;
  rotulo: string;
  valor: number;
}

export interface CriterioPatologia {
  id: string;
  versaoConfiguracaoId: string;
  nome: string;
  descricao?: string | null;
  peso?: number | null;
  ordem: number;
  escalas?: EscalaCriterioPatologia[];
}

export interface EscalaCriterioPatologia {
  id: string;
  criterioPatologiaId: string;
  rotulo: string;
  valor: number;
}

export interface MatrizAHP {
  id: string;
  versaoConfiguracaoId: string;
  tipo: TipoMatriz;
  dadosMatriz: number[][];
  indiceConsistencia?: number | null;
  razaoConsistencia?: number | null;
  valido: boolean;
}

export interface ResultadoAHP {
  pesos: number[];
  lambdaMax: number;
  indiceConsistencia: number;
  razaoConsistencia: number;
  valido: boolean;
}

export interface ScoreAtivo {
  sa: number;
  saMin: number;
  saMax: number;
  saNormalizado: number;
}

export interface ScorePatologia {
  sp: number;
  spMin: number;
  spMax: number;
  spNormalizado: number;
}

export interface FatorPatologias {
  fp: number;
  fpNormalizado: number;
  alertaExcesso: boolean;
  quantidadePatologias: number;
}

export interface NotaFinal {
  nf: number;
  nfFinal: number;
}

// Tipos para formulários e wizard
export interface FormCriterio {
  id?: string;
  nome: string;
  descricao?: string;
  escalas: FormEscala[];
  ordem: number;
}

export interface FormEscala {
  id?: string;
  rotulo: string;
  valor: number;
}

export interface WizardState {
  etapa: number;
  identificacao: {
    nome: string;
    descricao?: string;
    maxPatologiasEsperadas: number;
  };
  criteriosAtivo: FormCriterio[];
  matrizAtivo: number[][];
  criteriosPatologia: FormCriterio[];
  matrizPatologia: number[][];
  resultadoAhpAtivo?: ResultadoAHP;
  resultadoAhpPatologia?: ResultadoAHP;
}

// Tipos para export
export interface ExportData {
  tipoAtivo: TipoAtivo;
  versao: VersaoConfiguracao;
  criteriosAtivo: CriterioAtivo[];
  criteriosPatologia: CriterioPatologia[];
  matrizAtivo?: MatrizAHP;
  matrizPatologia?: MatrizAHP;
}

export interface ComparacaoVersoes {
  versaoA: VersaoConfiguracao;
  versaoB: VersaoConfiguracao;
}
