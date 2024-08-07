import {GameSettings, Quiz, QuizInput, UserData} from '../types';

const KEYS = {
  scoreIds: 'scoreIds',
  quizData: 'quizData',
  lastAttempt: 'lastAttempt',
  bestAttempts: 'bestAttempts',
  userSettings: 'userSettings',
  unsavedQuiz: 'unsavedQuiz',
  userData: 'userData',
  jwtToken: 'jwtToken',
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

  static saveUserSettings(settings: GameSettings) {
    localStorage.setItem(KEYS.userSettings, JSON.stringify(settings));
  }

  static fetchUserSettings(): GameSettings | undefined {
    const storedSettings = localStorage.getItem(KEYS.userSettings);
    if (!storedSettings) return;
    return JSON.parse(storedSettings);
  }

  static saveUnsavedQuiz(quizInput: QuizInput) {
    if (!quizInput) return;
    localStorage.setItem(KEYS.unsavedQuiz, JSON.stringify(quizInput));
  }

  static fetchUnsavedQuiz() {
    const storedQuiz = localStorage.getItem(KEYS.unsavedQuiz);
    if (!storedQuiz) {
      return;
    }
    return JSON.parse(storedQuiz);
  }
  static removeUnsavedQuiz() {
    localStorage.removeItem(KEYS.unsavedQuiz);
  }

  static saveUserData(user: UserData) {
    localStorage.setItem(KEYS.userData, JSON.stringify(user));
  }

  static fetchUserData() {
    const savedUser = localStorage.getItem(KEYS.userData);
    if (!savedUser) return;
    return JSON.parse(savedUser);
  }

  static clearUserData() {
    localStorage.removeItem(KEYS.userData);
  }

  static saveJwtToken(jwt: string) {
    localStorage.setItem(KEYS.jwtToken, jwt);
  }

  static fetchJwtToken() {
    return localStorage.getItem(KEYS.jwtToken);
  }

  static clearJwtToken() {
    localStorage.removeItem(KEYS.jwtToken);
  }
}
