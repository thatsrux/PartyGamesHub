export const CATEGORY_COLORS: Record<string, string> = {
  'Cinema e Serie TV': 'linear-gradient(135deg, #ec4899, #be185d)',
  'Musica': 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  'Storia e Mitologia': 'linear-gradient(135deg, #eab308, #a16207)',
  'Scienza e Natura': 'linear-gradient(135deg, #22c55e, #15803d)',
  'Tecnologia e Videogiochi': 'linear-gradient(135deg, #06b6d4, #0369a1)',
  'Letteratura e Arte': 'linear-gradient(135deg, #f97316, #c2410c)',
  'Geografia': 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  'Cucina e Tradizioni': 'linear-gradient(135deg, #ef4444, #b91c1c)',
  'Cultura Pop e Gossip': 'linear-gradient(135deg, #d946ef, #a21caf)',
  'Sport': 'linear-gradient(135deg, #14b8a6, #0f766e)'
};

export const CATEGORY_EMOJIS: Record<string, string> = {
  'Cinema e Serie TV': '🎬',
  'Musica': '🎵',
  'Storia e Mitologia': '🏛️',
  'Scienza e Natura': '🧬',
  'Tecnologia e Videogiochi': '🎮',
  'Letteratura e Arte': '📚',
  'Geografia': '🌍',
  'Cucina e Tradizioni': '🍕',
  'Cultura Pop e Gossip': '✨',
  'Sport': '⚽'
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_COLORS);

export const getCategoryColor = (category: string | undefined): string => {
  if (!category) return 'var(--bg-gradient, linear-gradient(135deg, #1e1b4b, #312e81))';
  return CATEGORY_COLORS[category] || 'var(--bg-gradient, linear-gradient(135deg, #1e1b4b, #312e81))';
};


import veroFalsoDb from '../data/vero_falso.json';
import falsarioDb from '../data/falsario.json';

export const CATEGORY_COUNTS: Record<string, Record<string, number>> = {
  'vero_o_fake': ALL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = (veroFalsoDb as any[]).filter(q => q.category === cat).length;
    return acc;
  }, {} as Record<string, number>),
  'falsario': ALL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = (falsarioDb as any[]).filter(q => q.category === cat).length;
    return acc;
  }, {} as Record<string, number>)
};
