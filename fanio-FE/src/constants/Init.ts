import {GAME_OPTIONS} from './Game';

export const INIT_SCORE = {
  totalScore: 0,
  totalTime: 0,
  guesses: [],
};

export const INIT_QUESTION_INPUT = {
  answer: '',
  url: '',
  sourceTitle: '',
  tags: [],
};

export const INIT_GAME_SETTINGS = {
  autoDeleteInput: {
    title: GAME_OPTIONS.GAME_SETTINGS_STRINGS.autoDeleteInput.title,
    description: GAME_OPTIONS.GAME_SETTINGS_STRINGS.autoDeleteInput.description,
    status: true,
  },
  autoInput: {
    title: GAME_OPTIONS.GAME_SETTINGS_STRINGS.autoInput.title,
    description: GAME_OPTIONS.GAME_SETTINGS_STRINGS.autoInput.description,
    status: true,
  },
  autoPlay: {
    title: GAME_OPTIONS.GAME_SETTINGS_STRINGS.autoPlay.title,
    description: GAME_OPTIONS.GAME_SETTINGS_STRINGS.autoPlay.description,
    status: true,
  },
};
