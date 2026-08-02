export interface PiuVicinoQuestion {
  question: string;
  min: number;
  max: number;
  answer: number;
  unit?: string;
}

export const piuVicinoQuestions: PiuVicinoQuestion[] = [
  {
    question: "Quanti abitanti ha il Giappone? (in milioni)",
    min: 50,
    max: 200,
    answer: 125,
    unit: "M"
  },
  {
    question: "In che anno è uscito Minecraft?",
    min: 2000,
    max: 2026,
    answer: 2011
  },
  {
    question: "Quanto pesa una balena azzurra adulta? (in tonnellate)",
    min: 50,
    max: 300,
    answer: 150,
    unit: "t"
  },
  {
    question: "Quanto è alta la Torre Eiffel? (in metri)",
    min: 150,
    max: 500,
    answer: 330,
    unit: "m"
  },
  {
    question: "Quanti ossa ha il corpo umano adulto?",
    min: 100,
    max: 400,
    answer: 206
  }
];
