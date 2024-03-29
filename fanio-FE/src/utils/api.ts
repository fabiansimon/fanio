import axios from 'axios';
import {
  GameStatistic,
  MetaData,
  PaginatedData,
  Quiz,
  QuizInput,
  Score,
  ScoreInput,
  TimeFrame,
} from '../types/index';
import ToastController from '../providers/ToastController';
import {sanitizeTerm} from './logic';
const BASE_URL = 'http://localhost:8080/api';

const _axios = axios.create({
  baseURL: BASE_URL,
  headers: {'Access-Control-Allow-Origin': '*'},
});

const ERROR_MESSAGE = {
  title: 'Sorry, something went wrong',
  description: 'This is on us. Please try again later.',
};

export async function fetchQuizById({id}: {id: string}): Promise<Quiz> {
  try {
    const response = await _axios.get<Quiz>(`/quiz/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch quiz by ID:', error);
    ToastController.showErrorToast(
      ERROR_MESSAGE.title,
      ERROR_MESSAGE.description,
    );
    throw error;
  }
}

export async function uploadQuiz(quiz: QuizInput): Promise<Quiz> {
  try {
    const response = await _axios.post<Quiz>('/create-quiz', quiz);
    return response.data;
  } catch (error) {
    console.error('Failed to create quiz:', error);
    ToastController.showErrorToast(
      ERROR_MESSAGE.title,
      ERROR_MESSAGE.description,
    );
    throw error;
  }
}

export async function uploadScore(score: ScoreInput): Promise<Score> {
  try {
    const res = await _axios.post<Score>('/upload-score', score);
    return res.data;
  } catch (error) {
    console.error('Failed to upload score:', error);
    ToastController.showErrorToast(
      ERROR_MESSAGE.title,
      ERROR_MESSAGE.description,
    );
    throw error;
  }
}

export async function fetchScoresFromQuiz({
  quizId,
  page = 0,
  size = 30,
}: {
  quizId: string;
  page?: number;
  size?: number;
}): Promise<{content: Score[] | []; totalElements: number}> {
  try {
    const res = await _axios.get(`/scores/${quizId}?page=${page}&size=${size}`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch scores:', error);
    ToastController.showErrorToast(
      ERROR_MESSAGE.title,
      ERROR_MESSAGE.description,
    );
    throw error;
  }
}

export async function fetchAllQuizzes(
  page: number = 0,
  size: number = 10,
): Promise<{content: Quiz[] | []; totalElements: number}> {
  try {
    const res = await _axios.get(`/quizzes?page=${page}&size=${size}`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch all quizzes:', error);
    ToastController.showErrorToast(
      ERROR_MESSAGE.title,
      ERROR_MESSAGE.description,
    );
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
    ToastController.showErrorToast(
      ERROR_MESSAGE.title,
      ERROR_MESSAGE.description,
    );
    throw error;
  }
}

export async function fetchTopQuizzes(
  page: number = 0,
  size: number = 10,
): Promise<PaginatedData<Quiz>> {
  try {
    const res = await _axios.get(`/quizzes?page=${page}&size=${size}`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch all quizzes:', error);
    ToastController.showErrorToast(
      ERROR_MESSAGE.title,
      ERROR_MESSAGE.description,
    );
    throw error;
  }
}

export async function fetchTopScores({
  timeFrame,
  page = 0,
  size = 10,
}: {
  timeFrame: TimeFrame;
  page?: number;
  size?: number;
}): Promise<PaginatedData<Score>> {
  try {
    const res = await _axios.get(
      `/top-scores?page=${page}&size=${size}&timeFrame=${timeFrame}`,
    );
    return res.data;
  } catch (error) {
    console.error('Failed to fetch top scores:', error);
    ToastController.showErrorToast(
      ERROR_MESSAGE.title,
      ERROR_MESSAGE.description,
    );
    throw error;
  }
}

export async function fetchGameStatistic(): Promise<GameStatistic> {
  try {
    const res = await _axios.get('/statistic');
    return res.data;
  } catch (error) {
    console.error('Failed to fetch all quizzes:', error);
    ToastController.showErrorToast(
      ERROR_MESSAGE.title,
      ERROR_MESSAGE.description,
    );
    throw error;
  }
}
