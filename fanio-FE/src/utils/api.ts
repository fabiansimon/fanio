import axios from 'axios';
import {MetaData, Quiz, QuizInput, Score, ScoreInput} from '../types/index';
import ToastController from '../providers/ToastController';
import {sanitizeTerm} from './logic';
const BASE_URL = 'http://localhost:8080/api';

const _axios = axios.create({
  baseURL: BASE_URL,
  headers: {'Access-Control-Allow-Origin': '*'},
});

export async function fetchQuizById(id: string): Promise<Quiz> {
  try {
    const response = await _axios.get<Quiz>(`/quiz/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch quiz by ID:', error);
    ToastController.showErrorToast();
    throw error;
  }
}

export async function uploadQuiz(quiz: QuizInput): Promise<Quiz> {
  try {
    const response = await _axios.post<Quiz>('/create-quiz', quiz);
    return response.data;
  } catch (error) {
    console.error('Failed to create quiz:', error);
    ToastController.showErrorToast();
    throw error;
  }
}

export async function uploadScore(score: ScoreInput): Promise<Score> {
  try {
    const res = await _axios.post<Score>('/upload-score', score);
    return res.data;
  } catch (error) {
    console.error('Failed to upload score:', error);
    ToastController.showErrorToast();
    throw error;
  }
}

export async function fetchScoresFromQuiz(quizId: string) {
  try {
    const res = await _axios.get(`/scores/${quizId}`);
    return res.data.content;
  } catch (error) {
    console.error('Failed to fetch scores:', error);
    ToastController.showErrorToast();
    throw error;
  }
}

export async function fetchAllQuizzes() {
  try {
    const res = await _axios.get(`/quizzes`);
    return res.data.content;
  } catch (error) {
    console.error('Failed to fetch all quizzes:', error);
    ToastController.showErrorToast();
    throw error;
  }
}

export async function fetchMetaData(url: string): Promise<MetaData> {
  try {
    const res = await _axios.post<MetaData>('/strip-meta', {
      url,
      type: 'youtube',
    });
    return res.data;
  } catch (error) {
    console.warn('Failed to fetch suggested title:', error);
    throw error;
  }
}

export async function searchQuizByTerm(term: string): Promise<Quiz[] | []> {
  try {
    term = sanitizeTerm(term);
    const res = await _axios.get(`/search-quiz?term=${term}`);
    return res.data.content;
  } catch (error) {
    console.error('Failed to fetch all quizzes:', error);
    throw error;
  }
}

export async function fetchTopQuizzes(
  page: number = 0,
  size: number = 10,
): Promise<{content: Quiz[] | []; totalElements: number}> {
  try {
    const res = await _axios.get(`/quizzes?page=${page}&size=${size}`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch all quizzes:', error);
    ToastController.showErrorToast();
    throw error;
  }
}
