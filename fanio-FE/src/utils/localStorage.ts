import {GameSettings, LocalScore, Quiz} from '../types';

const KEYS = {
  scoreIds: 'scoreIds',
  quizData: 'quizData',
  lastAttempts: 'lastAttempts',
  bestAttempts: 'bestAttempts',
  userSettings: 'userSettings',
};

export class LocalStorage {
  static fetchScoreIds(): Set<string> {
    const idsData = localStorage.getItem(KEYS.scoreIds);
    if (idsData) {
      return new Set(JSON.parse(idsData));
    }

    return new Set();
  }

  static saveScoreId(id: string) {
    const storedIds = this.fetchScoreIds();
    storedIds.add(id);
    localStorage.setItem(KEYS.scoreIds, JSON.stringify([...storedIds]));
  }

  static fetchStoredQuizzes(): Map<string, Quiz> {
    const quizData = localStorage.getItem(KEYS.quizData);
    if (quizData) {
      return new Map(JSON.parse(quizData));
    }
    return new Map();
  }

  static fetchStoredQuizById(id: string): Quiz | undefined {
    return this.fetchStoredQuizzes().get(id);
  }

  static saveQuizData(quiz: Quiz) {
    const storedQuizzes = this.fetchStoredQuizzes();
    storedQuizzes.set(quiz.id, quiz);
    localStorage.setItem(KEYS.quizData, JSON.stringify([...storedQuizzes]));
  }

  static clearQuizData() {
    localStorage.removeItem(KEYS.quizData);
  }

  static fetchLastAttempts(): Map<string, LocalScore> {
    const storedAttempts = localStorage.getItem(KEYS.lastAttempts);
    if (storedAttempts) return new Map(JSON.parse(storedAttempts));

    return new Map();
  }

  static fetchLastAttempt(quizId: string): LocalScore | undefined {
    const storedAttempts = this.fetchLastAttempts();
    if (storedAttempts.has(quizId)) return storedAttempts.get(quizId);

    return;
  }

  static saveLastAttempt(quizId: string, score: LocalScore) {
    const storedAttemps = this.fetchLastAttempts();
    storedAttemps.set(quizId, score);
    localStorage.setItem(KEYS.lastAttempts, JSON.stringify([...storedAttemps]));
  }

  static saveUserSettings(settings: GameSettings) {
    localStorage.setItem(KEYS.userSettings, JSON.stringify(settings));
  }

  static fetchUserSettings() {
    const storedSettings = localStorage.getItem(KEYS.userSettings);
    if (!storedSettings) return;
    return JSON.parse(storedSettings);
  }
}
