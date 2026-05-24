import { Activity, BookOpen, Briefcase, Heart, Target, DollarSign } from 'lucide-react';

export const PILARES = [
  { id: 'mental', nome: 'Mental', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
  { id: 'emocional', nome: 'Emocional', icon: Heart, color: 'bg-rose-100 text-rose-700' },
  { id: 'espiritual', nome: 'Espiritual', icon: Target, color: 'bg-purple-100 text-purple-700' },
  { id: 'fisico', nome: 'Físico', icon: Activity, color: 'bg-green-100 text-green-700' },
  { id: 'profissional', nome: 'Profissional', icon: Briefcase, color: 'bg-amber-100 text-amber-700' },
  { id: 'financeiro', nome: 'Financeiro', icon: DollarSign, color: 'bg-emerald-100 text-emerald-800' }
];
