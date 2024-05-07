import {GAME_OPTIONS} from '../constants/Game';
import {Question} from '../types';

export function shuffle(questions: Question[]) {
  for (var i = questions.length - 1; i > 0; i--) {
    const j = randomNumber({max: i});
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  return questions;
}

export function similarity(input: string, answer: string) {
  input = sanitizeTerm(input);
  let bestScore = 0;
  for (let a of answer.split('/')) {
    a = sanitizeTerm(a);
    const max = Math.max(input.length, a.length);
    if (max === 0) {
      bestScore = 100;
    } else {
      bestScore = Math.max(
        ((max - levenshteinDistance(input, a)) / max) * 100,
        bestScore,
      );
    }
  }

  return bestScore;
}

export function sanitizeTerm(input: string) {
  let clean = '';
  for (const char of input) {
    if (!/[\s!@#$%^*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(char)) {
      if (/[äöüß&]/.test(char)) {
        clean += cleanSpecialCharacters(char.toLowerCase());
      } else {
        clean += char.toLowerCase();
      }
    }
  }

  return clean;
}

export function rateScore(currScore: number, topScore: number) {
  const maxRating = GAME_OPTIONS.POST_GAME_TITLES.length - 1;
  const scaledRatio = Math.round((currScore / topScore) * maxRating);

  return maxRating - Math.max(0, Math.min(scaledRatio, maxRating));
}

function cleanSpecialCharacters(c: string) {
  switch (c) {
    case '&':
      return 'and';
    case 'ä':
      return 'ae';
    case 'ö':
      return 'oe';
    case 'ü':
      return 'ue';
    case 'ß':
      return 'ss';
    default:
      return '';
  }
}

export function randomNumber({min = 0, max}: {min?: number; max: number}) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function calculatePoints({
  length,
  delta,
}: {
  length: number;
  delta: number;
}) {
  const max = GAME_OPTIONS.MAX_POINTS_PER_ROUND;
  const co = 0.01; // sensitivity
  const b = max / Math.log10(co * length + 1);
  const score = max - b * Math.log10(co * delta + 1);

  return {
    points: Math.max(0, score),
  };
}

export function inputThreshold(answer: string, input: string) {
  let min = 100;
  for (const a of answer.split('/')) {
    min = Math.min(min, a.length);
  }
  return min - input.length <= GAME_OPTIONS.INPUT_ANSWER_DIFFERENCE;
}

function levenshteinDistance(a: string, b: string) {
  const matrix = [];

  var i = 0;
  for (; i <= a.length; i++) {
    matrix[i] = [i];
  }

  i = 0;
  for (; i <= b.length; i++) {
    matrix[0][i] = i;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
        continue;
      }

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + 1, // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}
