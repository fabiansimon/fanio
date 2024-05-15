import axios from 'axios';
import {
  GameStatistic,
  MetaData,
  PaginatedData,
  PlayableQuiz,
  Quiz,
  QuizInput,
  Score,
  ScoreInput,
  TimeFrame,
  UserData,
} from '../types/index';
import ToastController from '../controllers/ToastController';
import {sanitizeTerm} from './logic';
import {LocalStorage} from './localStorage';

const BASE_URL = 'http://localhost:8080/api';
// const BASE_URL = 'https://verseus.world/api/';

const _axios = axios.create({
  baseURL: BASE_URL,
  headers: {'Access-Control-Allow-Origin': '*'},
});

const FALLBACK_ERROR_MESSAGE = {
  title: 'Sorry, something went wrong',
  description: 'This is on us. Please try again later.',
};

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

export function setJwtToken(jwt: string) {
  console.log('Hallo Token: ', jwt);
  _axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
}

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
  quizId,
}: {
  quizId: string;
  showScore?: boolean;
}): Promise<PlayableQuiz> {
  try {
    const response = await _axios.get<PlayableQuiz>(
      `/quiz/${quizId}?includeDetails=true`,
    );
    return response.data;
  } catch (error) {
    handleError({error, callName: 'fetchPlayableQuizById'});
    throw error;
  }
}

export async function uploadQuiz({
  quiz,
  userId,
}: {
  quiz: QuizInput;
  userId: string;
}): Promise<Quiz> {
  try {
    const response = await _axios.post<Quiz>(`/create-quiz?userId=${userId}`, {
      ...quiz,
      ...quiz.options,
    });
    return response.data;
  } catch (error) {
    handleError({error, callName: 'uploadQuiz'});
    throw error;
  }
}

export async function uploadScore({
  score,
  userId,
}: {
  score: ScoreInput;
  userId: string;
}): Promise<Score> {
  try {
    const res = await _axios.post<Score>(
      `/upload-score?userId=${userId}`,
      score,
    );
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

export async function fetchMetaData(url: string): Promise<MetaData[]> {
  try {
    const res = await _axios.post<MetaData[]>('/strip-meta', {
      url,
      type: 'youtube',
    });
    return res.data;
  } catch (error) {
    handleError({error, callName: 'fetchMetaData'});
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

export async function fetchTopQuizzes({
  page = 0,
  size = 10,
  timeFrame = TimeFrame.ALLTIME,
}: {
  page: number;
  size: number;
  timeFrame?: TimeFrame;
}): Promise<PaginatedData<Quiz>> {
  try {
    const res = await _axios.get(
      `/top-quizzes?page=${page}&size=${size}&timeFrame=${timeFrame}`,
    );
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

export async function authUser({token}: {token: string}): Promise<UserData> {
  try {
    const res = await _axios.post('/auth/google', {
      token,
    });

    const {jwt, user} = res.data;
    LocalStorage.saveJwtToken(jwt);
    setJwtToken(jwt);

    return user;
  } catch (error) {
    handleError({error, callName: 'authUser'});
    throw error;
  }
}

export async function onGameFinish({
  quizId,
}: {
  quizId: string;
}): Promise<number> {
  try {
    const res = await _axios.patch(`/quiz-finished/${quizId}`);
    return res.data;
  } catch (error) {
    handleError({error, callName: 'onGameFinish', showError: false});
    throw error;
  }
}
