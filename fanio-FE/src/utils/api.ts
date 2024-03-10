import axios from 'axios';
import {Quiz, QuizInput, ScoreInput} from '../types/index';
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
    throw error;
  }
}

export async function createQuiz(quiz: QuizInput): Promise<Quiz> {
  try {
    const response = await _axios.post<Quiz>('/create-quiz', quiz);
    return response.data;
  } catch (error) {
    console.error('Failed to create quiz:', error);
    throw error;
  }
}

export async function uploadScore(score: ScoreInput): Promise<void> {
  try {
    await _axios.post<void>('/upload-score', score);
  } catch (error) {
    console.error('Failed to upload score:', error);
    throw error;
  }
}

export async function fetchScoresFromQuiz(quizId: string) {
  try {
    const res = await _axios.get(`/scores/${quizId}`);
    return res.data.content;
  } catch (error) {
    console.error('Failed to fetch scores:', error);
    throw error;
  }
}

export async function fetchAllQuizzes() {
  try {
    const res = await _axios.get(`/quizzes`);
    return res.data.content;
  } catch (error) {
    console.error('Failed to fetch all quizzes:', error);
    throw error;
  }
}
