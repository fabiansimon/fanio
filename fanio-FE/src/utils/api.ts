import axios from 'axios';
import {Quiz, QuizInput, Score, ScoreInput} from '../types/index';
import ToastController from '../providers/ToastController';
const BASE_URL = 'http://localhost:8080/api';

const _axios = axios.create({
  baseURL: BASE_URL,
  //headers: {"Access-Control-Allow-Origin": "*"}
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

export async function fetchTitleSuggestion(url: string): Promise<string> {
  try {
    const res = await _axios.post<string>('/strip-meta', {
      url,
      type: 'youtube',
    });
    return res.data;
  } catch (error) {
    console.warn('Failed to fetch suggested title:', error);
    throw error;
  }
}
