export interface GameConfig {
  id: string;
  title: string;
  icon: string;
  defaultSettings: Record<string, any>;
  hasRounds: boolean;
  minRounds?: number;
  maxRounds?: number;
  hasDuration: boolean;
  minDuration?: number;
  maxDuration?: number;
  hasCategories: boolean;
}

export const GAMES_CONFIG: Record<string, GameConfig> = {
  'multigame': { 
    id: 'multigame', title: 'Multigioco', icon: '🔀', 
    defaultSettings: { rounds: 1, duration: 30, selectedGames: ['vero_o_fake', 'la_carriera', 'impostore', 'nomi_cose_citta', 'falsario', 'disegnatore', 'quiz4', 'piu_vicino', 'ordina', 'indovina_immagine', 'jeopardy'] },
    hasRounds: true, maxRounds: 10,
    hasDuration: false,
    hasCategories: false
  },
  'vero_o_fake': { 
    id: 'vero_o_fake', title: 'Vero o Falso', icon: '🃏', 
    defaultSettings: { rounds: 10, duration: 15, excludedCategories: [] },
    hasRounds: true,
    hasDuration: true,
    hasCategories: true
  },
  'quiz4': { 
    id: 'quiz4', title: 'Quiz 4 Risposte', icon: '⭐', 
    defaultSettings: { rounds: 10, duration: 15, excludedCategories: [] },
    hasRounds: true,
    hasDuration: true,
    hasCategories: true
  },
  'la_carriera': { 
    id: 'la_carriera', title: 'La Carriera', icon: '⚽', 
    defaultSettings: { rounds: 10, duration: 30 },
    hasRounds: true,
    hasDuration: true,
    hasCategories: false
  },
  'impostore': { 
    id: 'impostore', title: 'Impostore', icon: '🕵️‍♂️', 
    defaultSettings: { rounds: 5, duration: 60, impostoreCategory: 'Animali', impostorsCount: 1, impostorHint: false },
    hasRounds: true,
    hasDuration: true,
    hasCategories: false
  },
  'nomi_cose_citta': { 
    id: 'nomi_cose_citta', title: 'Nomi, Cose, Città', icon: '📝', 
    defaultSettings: { rounds: 3, duration: 60, categories: ['Nomi', 'Cose', 'Città', 'Animali', 'Mestieri'] },
    hasRounds: true, maxRounds: 10,
    hasDuration: true,
    hasCategories: false
  },
  'falsario': { 
    id: 'falsario', title: 'Falsario', icon: '🤥', 
    defaultSettings: { rounds: 5, duration: 45, excludedCategories: [] },
    hasRounds: true,
    hasDuration: true,
    hasCategories: true
  },
  'disegnatore': { 
    id: 'disegnatore', title: 'Disegnatore', icon: '🎨', 
    defaultSettings: { rounds: 2, duration: 60 },
    hasRounds: true, maxRounds: 4,
    hasDuration: true,
    hasCategories: false
  },
  'piu_vicino': { 
    id: 'piu_vicino', title: 'Più Vicino Vince', icon: '🎯', 
    defaultSettings: { rounds: 5, duration: 30 },
    hasRounds: true,
    hasDuration: true,
    hasCategories: false
  },
  'ordina': { 
    id: 'ordina', title: 'Ordina', icon: '📋', 
    defaultSettings: { rounds: 5, duration: 45 },
    hasRounds: true,
    hasDuration: true,
    hasCategories: false
  },
  'indovina_immagine': { 
    id: 'indovina_immagine', title: 'Indovina l\'Immagine', icon: '🖼️', 
    defaultSettings: { rounds: 5, duration: 30 },
    hasRounds: true,
    hasDuration: true,
    hasCategories: false
  },
  'jeopardy': { 
    id: 'jeopardy', title: 'Jeopardy', icon: '🧠', 
    defaultSettings: { categorySelectionMode: 'admin', adminCategories: ['Cinema e Serie TV', 'Storia e Mitologia', 'Musica', 'Scienza e Natura', 'Sport'] },
    hasRounds: false,
    hasDuration: false,
    hasCategories: false
  }
};
