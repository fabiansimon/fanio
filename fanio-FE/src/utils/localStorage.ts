import {Quiz} from '../types';

const KEYS = {
  scoreIds: 'scoreIds',
  quizData: 'quizData',
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
}
