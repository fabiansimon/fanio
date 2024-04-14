import {LobbyData, LobbyMember} from '../types';
import {GAME_OPTIONS} from './Game';

export const INIT_SCORE = {
  totalScore: 0,
  totalTime: 0,
  guesses: [],
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

export const INIT_LOBBY_DATA: LobbyData = {
  currRound: -1,
  lobbyId: '',
  members: [],
  quizId: '',
};

const INIT_LOBBY_MEMBER: LobbyMember = {
  currRound: 0,
  sessionToken: '',
  timeElapsed: 0,
  totalScore: 0,
  userName: '',
};

export const INIT_USER_DATA = {
  userName: '',
  sessionToken: '',
  memberData: INIT_LOBBY_MEMBER,
};
