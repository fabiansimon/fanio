export enum TimeFrame {
  DAILY = 'day',
  WEEKLY = 'week',
  MONTHLY = 'month',
  ALLTIME = 'allTime',
}
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
  isPrivate: boolean;
  randomOffsets: true;
}

export interface Question {
  id: string;
  url: string;
  addedAt: Date;
  updatedAt: Date;
  answer: string;
  sourceTitle?: string;
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

export type LocalScore = Omit<Score, 'id' | 'userName'> & {isUploaded: boolean};

export interface QuestionInput {
  url: string;
  answer: string;
  sourceTitle?: string;
  startOffset?: number;
  maxLength?: number;
  imageUri?: string;
}

export interface QuizInput {
  title: string;
  description?: string;
  questions: QuestionInput[];
  artists?: string[];
  options: QuizOptions;
}

export interface ScoreInput {
  userName: string;
  timeElapsed: number;
  totalScore: number;
  quizId: string;
}

export interface MetaData {
  sourceTitle: string;
  title: string;
  length: number;
  imageUri: string;
}

export interface PaginationState {
  maxItems: number;
  pageIndex: number;
}

export interface PaginatedData<T> {
  totalElements: number;
  content: T[];
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

export interface ModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
}

export interface GuessResult {
  correct: boolean;
  delta: number;
  points: number;
}

export enum AchievementType {
  FIRST,
  SECOND,
  THIRD,
  DAILY,
  WEEK,
  MONTHLY,
}

export enum BreakPoint {
  SM,
  MD,
  LG,
  XL,
  XXL,
}

export interface ScoreState {
  totalScore: number;
  totalTime: number;
  guesses: Guess[];
}

interface Guess {
  elapsedTime: number; // in milliseconds
  score: number;
}

interface QuizOptions {
  randomOffsets: boolean;
  isPrivate: boolean;
}

export interface GameSettings {
  autoPlay: Setting;
  autoInput: Setting;
  autoDeleteInput: Setting;
}

export type GameSettingKey = 'autoDeleteInput' | 'autoInput' | 'autoPlay';

interface Setting {
  title: string;
  description: String;
  status: boolean;
}

export enum ChipType {
  PRIVATE,
  PUBLIC,
}

export enum GameState {
  PRE,
  PLAYING,
  POST,
  LOBBY,
}

export enum UIState {
  CORRECT,
  INCORRECT,
}

export enum ToastType {
  ERROR,
  WARNING,
  SUCCESS,
}

export interface LobbyMember {
  sessionToken: string;
  userName: string;
  totalScore: number;
  timeElapsed: number;
  currRound: number;
}

export interface LobbyData {
  lobbyId: string;
  members: LobbyMember[];
  currRound: number;
  quiz?: Quiz;
  quizId?: string;
}

export interface InitLobbyData {
  quiz: Quiz;
  topScore?: Score;
  lobby: Omit<LobbyData, 'currRound' | 'members'> & {
    membersAsList: LobbyMember[];
    members: {[key: string]: LobbyMember};
  };
}
