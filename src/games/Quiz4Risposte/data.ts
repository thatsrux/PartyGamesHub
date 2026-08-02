export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export const quizQuestions: QuizQuestion[] = [
  {
    question: "Qual è la capitale dell'Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Perth"],
    correctIndex: 2
  },
  {
    question: "Qual è il pianeta più grande del sistema solare?",
    options: ["Terra", "Marte", "Giove", "Saturno"],
    correctIndex: 2
  },
  {
    question: "Chi ha dipinto la Gioconda?",
    options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
    correctIndex: 1
  },
  {
    question: "In che anno è caduto il Muro di Berlino?",
    options: ["1987", "1989", "1991", "1993"],
    correctIndex: 1
  },
  {
    question: "Qual è l'oceano più grande della Terra?",
    options: ["Oceano Atlantico", "Oceano Indiano", "Oceano Artico", "Oceano Pacifico"],
    correctIndex: 3
  }
];
