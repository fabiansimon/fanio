export interface Quiz {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  creatorId: string;
  questions: Question[];
}

export interface Question {
  id: string;
  url: string;
  addedAt: Date;
  updatedAt: Date;
  answer: string;
  startOffset?: number;
}

export interface Score {
  id: string;
  createdAt: Date;
  quizId: string;
  userName: string;
  timeElapsed: number;
  score: number;
}

export interface QuestionInput {
  url: string;
  answer: string;
  startOffset?: number;
}

export interface QuizInput {
  title: string;
  description?: string;
  questions: QuestionInput[];
}

export interface ScoreInput {
  userName: string;
  timeElapsed: number;
  score: number;
  quizId: string;
}
