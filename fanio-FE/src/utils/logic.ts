import {Question} from '../types';

export function shuffle(questions: Question[]) {
  for (var i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  return questions;
}

export function similarity(input: string, answer: string) {
  input = sanitizeTerm(input);
  answer = sanitizeTerm(answer);
  const max = Math.max(input.length, answer.length);
  if (max === 0) return 100;

  return ((max - levenshteinDistance(input, answer)) / max) * 100;
}

export function sanitizeTerm(input: string) {
  let clean = '';
  for (const char of input) {
    if (!/[\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(char)) {
      if (/[äöüß]/.test(char)) {
        clean += cleanSpecialCharacters(char.toLowerCase());
      } else {
        clean += char.toLowerCase();
      }
    }
  }

  return clean;
}

function cleanSpecialCharacters(c: string) {
  switch (c) {
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
