export interface OrdinaQuestion {
  question: string;
  items: string[]; // L'ordine corretto
}

export const ordinaQuestions: OrdinaQuestion[] = [
  {
    question: "Ordina questi film per anno di uscita (dal più vecchio al più recente)",
    items: ["Il Padrino", "Guerre Stellari", "Titanic", "Avatar"]
  },
  {
    question: "Ordina queste nazioni per popolazione (dalla più popolosa alla meno popolosa)",
    items: ["Cina", "India", "Stati Uniti", "Indonesia"]
  },
  {
    question: "Ordina questi animali dal più veloce al più lento",
    items: ["Ghepardo", "Leone", "Cavallo", "Uomo"]
  },
  {
    question: "Ordina i pianeti dal più vicino al Sole al più lontano",
    items: ["Mercurio", "Venere", "Terra", "Marte"]
  },
  {
    question: "Ordina queste invenzioni cronologicamente (dalla più vecchia alla più recente)",
    items: ["Stampa a caratteri mobili", "Motore a vapore", "Lampadina", "Internet"]
  }
];
