export const GAME_OPTIONS = {
  POST_GAME_TITLES: [
    'WOW!!',
    'Well Done!',
    'Not too bad!',
    'Hmm',
    "Let's try again.",
    'Meh!',
  ],
  POST_GAME_SUBTITLES: [
    'What a fan you are!',
    'You did amazing',
    'Look at you, getting closer...',
    'Good for a beginner',
    'I know you can do better than this',
    "I don't want to lie to you, that wasn't great.",
  ],
  PLACEHOLDER: {
    youtubeSongUrl: 'e.g: www.youtube.com/watch?v=c5WbOCztjQs',
    youtubePlaylist:
      'e.g: www.youtube.com/watch?v=gy9d9fMzNMI&list=RDgy9d9fMzNMI',
  },
  MAX_POINTS_PER_ROUND: 1_000,
  MAX_SCORE_USERNAME_LENGTH: 20,
  MAX_QUIZ_TITLE_LENGTH: 25,
  MAX_QUIZ_DESCRIPTION_LENGTH: 50,
  MAX_QUIZ_SONGS: 15,
  MIN_QUIZ_SONGS: 3,
  SONG_TIMEOUT: 3_000,
  POINTS_UPDATE_TIMEOUT: 1_200,
  ANSWER_THRESHOLD: 70,
  LOADING_THRESHOLD: 1_500,
  GAME_SETTINGS_STRINGS: {
    autoPlay: {
      title: 'Auto Play',
      description: 'Next Song will be played automatically',
    },
    autoInput: {
      title: 'Auto Input',
      description: 'Guess will be filled in if close enough',
    },
    autoDeleteInput: {
      title: 'Auto Clear',
      description: 'Input will be cleared after a incorrect Guess',
    },
  },
};
