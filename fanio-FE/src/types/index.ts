export enum OperationSystem {
  WINDOWS,
  MAC,
  LINUX,
  IOS,
  ANDROID,
  MISC,
}

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
  totalScore: number;
}

export interface QuestionInput {
  url: string;
  answer: string;
  startOffset?: number;
  maxLength?: number;
  imageUri?: string;
}

export interface QuizInput {
  title: string;
  description?: string;
  questions: QuestionInput[];
}

export interface ScoreInput {
  userName: string;
  timeElapsed: number;
  totalScore: number;
  quizId: string;
}

export interface MetaData {
  title: string;
  length: number;
  imageUri: string;
}

export interface PaginationState {
  maxItems: number;
  pageIndex: number;
}

export interface PaginatedQuizData {
  totalElements: number;
  content: Quiz[];
}

export interface GameStatistic {
  totalQuizzes: number;
  totalGuesses: number;
  totalSongs: number;
  totalTime: number;
}

export enum ButtonType {
  primary,
  secondary,
  outline,
}
