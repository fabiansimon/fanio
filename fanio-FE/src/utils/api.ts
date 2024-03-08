import axios from "axios";
import { Quiz } from "../types/index"
const BASE_URL = "http://localhost:8080/api";

const _axios = axios.create({
    baseURL: BASE_URL,
    //headers: {"Access-Control-Allow-Origin": "*"}
})

export async function fetchQuizById(id: string): Promise<Quiz> {
    try {
        const response = await _axios.get<Quiz>(`/quiz/${id}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch quiz by ID:', error);
        throw error;
    }
}