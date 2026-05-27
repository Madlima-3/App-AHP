import { Activity, BookOpen, Briefcase, Heart, Target, DollarSign } from 'lucide-react';

export const PILARES = [
  { id: 'mental', nome: 'Mental', icon: BookOpen, color: 'bg-vblue-100 text-vblue', borderColor: 'border-vblue-100' },
  { id: 'emocional', nome: 'Emocional', icon: Heart, color: 'bg-vpink-100 text-vpink-700', borderColor: 'border-vpink-100' },
  { id: 'espiritual', nome: 'Espiritual', icon: Target, color: 'bg-vcoral-50 text-vcoral-700', borderColor: 'border-vcoral-100' },
  { id: 'fisico', nome: 'Físico', icon: Activity, color: 'bg-vyellow-100 text-vyellow-800', borderColor: 'border-vyellow-100' },
  { id: 'profissional', nome: 'Profissional', icon: Briefcase, color: 'bg-vblue-50 text-vblue-700', borderColor: 'border-vblue-100' },
  { id: 'financeiro', nome: 'Financeiro', icon: DollarSign, color: 'bg-vyellow-50 text-vyellow-800', borderColor: 'border-vyellow-100' }
];
