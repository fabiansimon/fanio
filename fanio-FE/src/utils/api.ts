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

const FALLBACK_ERROR_MESSAGE = {
  title: 'Sorry, something went wrong',
  description: 'This is on us. Please try again later.',
};

export async function fetchQuizById({id}: {id: string}): Promise<Quiz> {
  try {
    const response = await _axios.get<Quiz>(`/quiz/${id}`);
    return response.data;
  } catch (error) {
    handleError({error, callName: 'fetchQuizById'});
    throw error;
  }
}

export async function fetchPlayableQuizById({
  id,
}: {
  id: string;
  showScore?: boolean;
}): Promise<{quiz: Quiz; topScore: Score}> {
  try {
    const response = await _axios.get<{quiz: Quiz; topScore: Score}>(
      `/quiz/${id}?includeScore=true`,
    );
    return response.data;
  } catch (error) {
    handleError({error, callName: 'fetchPlayableQuizById'});
    throw error;
  }
}

export async function uploadQuiz(quiz: QuizInput): Promise<Quiz> {
  try {
    console.log({
      ...quiz,
      ...quiz.options,
    });
    const response = await _axios.post<Quiz>('/create-quiz', {
      ...quiz,
      ...quiz.options,
    });
    return response.data;
  } catch (error) {
    handleError({error, callName: 'uploadQuiz'});
    throw error;
  }
}

export async function uploadScore(score: ScoreInput): Promise<Score> {
  try {
    const res = await _axios.post<Score>('/upload-score', score);
    return res.data;
  } catch (error) {
    handleError({error, callName: 'uploadScore'});
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
    handleError({error, callName: 'fetchScoresFromQuiz'});
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
    handleError({error, callName: 'fetchAllQuizzes'});
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
    handleError({error, callName: 'fetchMetaData', showError: false});
    throw error;
  }
}

export async function searchQuizByTerm(term: string): Promise<Quiz[] | []> {
  try {
    term = sanitizeTerm(term);
    const res = await _axios.get(`/search-quiz?term=${term}`);
    return res.data.content;
  } catch (error) {
    handleError({error, callName: 'searchQuizByTerm'});
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
    handleError({error, callName: 'fetchTopQuizzes'});
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
    handleError({error, callName: 'fetchTopScores'});
    throw error;
  }
}

export async function fetchGameStatistic(): Promise<GameStatistic> {
  try {
    const res = await _axios.get('/statistic');
    return res.data;
  } catch (error) {
    handleError({error, callName: 'fetchGameStatistic'});
    throw error;
  }
}

export async function fetchScorePlacement({
  quizId,
  score,
}: {
  quizId: string;
  score: number;
}): Promise<number> {
  try {
    const res = await _axios.get(
      `/score-placement?quizId=${quizId}&score=${score}`,
    );
    return res.data;
  } catch (error) {
    handleError({error, callName: 'fetchScorePlacement'});
    throw error;
  }
}

function handleError({
  error,
  callName,
  showError = true,
}: {
  error: unknown;
  callName: string;
  showError?: boolean;
}) {
  console.error(`Failed request at function [${callName}]`, error);

  if (!showError) return;

  let errorTitle = FALLBACK_ERROR_MESSAGE.title;
  let errorDescription = FALLBACK_ERROR_MESSAGE.description;

  if (axios.isAxiosError(error) && error.response) {
    const [title, description] = Object.entries(error.response.data)[0];
    errorTitle = title;
    errorDescription = description as string;
  }

  ToastController.showErrorToast(errorTitle, errorDescription);
}
