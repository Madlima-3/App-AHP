import { Activity, BookOpen, Briefcase, Heart, Target, DollarSign } from 'lucide-react';

export const TIPOS_META = [
  {
    id: 'marco',
    label: 'Ação Única',
    descricao: 'Tarefa pontual concluída uma única vez.',
    exemplo: 'Ex: Contratar seguro de vida, matricular filho na escola.',
  },
  {
    id: 'habito',
    label: 'Hábito Diário',
    descricao: 'Marque cada dia que realizou — acompanhe sua sequência na semana.',
    exemplo: 'Ex: Meditação matinal, leitura antes de dormir, oração em família.',
  },
  {
    id: 'frequencia',
    label: 'Frequência',
    descricao: 'Conte quantas vezes realizou no período. Cada dia conta como 1 vez, sem importar a duração.',
    exemplo: 'Ex: Academia 3x/semana, ligar para os pais 2x/mês, jantar em família 4x/semana.',
  },
  {
    id: 'quantitativo',
    label: 'Quantitativo',
    descricao: 'Acumule um volume com unidade própria — o quanto fez em cada registro importa.',
    exemplo: 'Ex: Correr 20 km/semana, estudar 10 horas/semana, economizar R$ 500/mês, ler 200 páginas/mês.',
  },
];

export const PILARES = [
  { id: 'mental', nome: 'Mental', icon: BookOpen, color: 'bg-vblue-100 text-vblue', borderColor: 'border-vblue-100' },
  { id: 'emocional', nome: 'Emocional', icon: Heart, color: 'bg-vpink-100 text-vpink-700', borderColor: 'border-vpink-100' },
  { id: 'espiritual', nome: 'Espiritual', icon: Target, color: 'bg-vcoral-50 text-vcoral-700', borderColor: 'border-vcoral-100' },
  { id: 'fisico', nome: 'Físico', icon: Activity, color: 'bg-vyellow-100 text-vyellow-800', borderColor: 'border-vyellow-100' },
  { id: 'profissional', nome: 'Profissional', icon: Briefcase, color: 'bg-vblue-50 text-vblue-700', borderColor: 'border-vblue-100' },
  { id: 'financeiro', nome: 'Financeiro', icon: DollarSign, color: 'bg-vyellow-50 text-vyellow-800', borderColor: 'border-vyellow-100' }
];
