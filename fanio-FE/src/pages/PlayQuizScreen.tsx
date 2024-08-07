import {useParams} from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactPlayer from 'react-player';
import {
  GameSettings,
  GameState,
  GuessResult,
  LocalScore,
  Quiz,
  Score,
  ScoreState,
  UIState,
  UserData,
} from '../types';
import {fetchPlayableQuizById, onGameFinish} from '../utils/api';
import {shuffle} from 'lodash';
import {
  calculatePoints,
  inputThreshold,
  randomNumber,
  similarity,
} from '../utils/logic';
import InputField from '../components/InputField';
import PostGameScene from '../components/PostGameScene';
import PreGameScene from '../components/PreGameScene';
import {PointsBarRef} from '../components/PointsBar';
import {LocalStorage} from '../utils/localStorage';
import AnimatedResult from '../components/AnimatedResult';
import {motion} from 'framer-motion';
import {GAME_OPTIONS} from '../constants/Game';
import QuizStatsContainer from '../components/QuizStatsContainer';
import useKeyShortcut from '../hooks/useKeyShortcut';
import {Heading, Text} from '@radix-ui/themes';
import {UI} from '../utils/common';
import QuickOptionsContainer from '../components/QuickOptionsContainer';
import {INIT_GAME_SETTINGS, INIT_SCORE} from '../constants/Init';
import ToastController from '../controllers/ToastController';
import MusicLoader from '../components/MusicLoader';
import GameDetailsContainer from '../components/GameDetailsContainer';
import {TrackNextIcon} from '@radix-ui/react-icons';

function PlayQuizScreen(): JSX.Element {
  useKeyShortcut(
    'Enter',
    () => {
      if (result && !settings.autoPlay.status) return updateGameRound();
      if (!isPlaying || result || gameState !== GameState.PLAYING) return;
      handleSubmitGuess(true);
    },
    true,
  );
  const {quizId} = useParams();

  const videoRef = useRef<ReactPlayer>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const barRef = useRef<PointsBarRef>(null);
  const backgroundRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState>(GameState.PRE);
  const [questionIndex, setQuestionIndex] = useState<number>(0);

  const [quizData, setQuizData] = useState<
    (Quiz & {creator: UserData}) | undefined
  >();
  const [topScore, setTopScore] = useState<Score | undefined>();
  const [lastAttempt, setLastAttempt] = useState<LocalScore | undefined>();

  const [input, setInput] = useState<string>('');
  const [score, setScore] = useState<ScoreState>(INIT_SCORE);
  const [timestamp, setTimestamp] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [result, setResult] = useState<GuessResult | undefined>();
  const [settings, setSettings] = useState<GameSettings>(
    LocalStorage.fetchUserSettings() || INIT_GAME_SETTINGS,
  );

  const question = useMemo(() => {
    if (quizData) return quizData.questions[questionIndex];

    return null;
  }, [quizData, questionIndex]);

  const disableInput = useMemo(
    () => result !== undefined || !isPlaying,
    [result, isPlaying],
  );

  // console.warn('Current Question', question?.answer);

  const handlePlay = useCallback(() => {
    if (!isPlaying) setIsPlaying(true);
    handleSongOffset();
  }, []);

  const handleSongOffset = () => {
    if (
      !question ||
      !quizData ||
      !(question.startOffset || quizData.randomOffsets) ||
      !videoRef.current
    )
      return;

    let offset: number;

    if (quizData.randomOffsets) {
      const boundary =
        videoRef.current.getDuration() * GAME_OPTIONS.MAX_OFFSET_BOUNDARY;
      offset = randomNumber({
        min: boundary,
        max: videoRef.current.getDuration() - boundary,
      });
    } else {
      offset = question.startOffset!;
    }

    videoRef.current?.seekTo(offset, 'seconds');
  };

  const resetGame = () => {
    setGameState(GameState.PRE);
    setQuestionIndex(0);
    setScore(INIT_SCORE);
  };

  useEffect(() => {
    if (settings.autoInput.status) handleSubmitGuess();
  }, [input, settings]);

  useEffect(() => {
    LocalStorage.saveUserSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (questionIndex === quizData?.questions.length) {
      onFinishRound();
    }
  }, [questionIndex, quizData?.questions]);

  useEffect(() => {
    if (!quizId) return;
    (async () => {
      try {
        const {quiz, topScore} = await fetchPlayableQuizById({quizId});
        setQuizData({
          ...quiz,

          questions: shuffle(quiz.questions),
        });
        setTopScore(topScore);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [quizId]);

  const updateTotalPlays = async () => {
    const plays = await onGameFinish({quizId: quizId!});
    if (quizData?.totalPlays !== plays) {
      setQuizData(prev => {
        if (!prev) return;
        return {...prev, totalPlays: plays};
      });
    }
  };

  const onFinishRound = () => {
    setLastAttempt({
      createdAt: new Date(),
      quizId: quizId!,
      timeElapsed: score.totalTime,
      totalScore: score.totalScore,
      isUploaded: false,
    });
    updateTotalPlays();
    setQuizData(prev => {
      if (!prev) return;
      return {...prev, totalPlays: prev.totalPlays + 1};
    });
    setGameState(GameState.POST);
  };

  const handleSubmitGuess = (onEnter?: boolean) => {
    if (!isValidInput()) {
      if (onEnter) {
        changeUIState(UIState.INCORRECT);
        if (settings.autoDeleteInput.status) setInput('');
      }
      return;
    }

    changeUIState(UIState.CORRECT);

    const now = performance.now();
    const delta = (now - timestamp) / 1000;
    const {points} = calculatePoints({
      length: videoRef.current!.getDuration(),
      delta,
    });

    updateResult({result: {correct: true, delta, points}, now});

    setTimeouts(points);
  };

  const isValidInput = () => {
    return (
      input &&
      question &&
      videoRef.current &&
      !result &&
      inputThreshold(question.answer, input) &&
      similarity(input, question!.answer) > GAME_OPTIONS.ANSWER_THRESHOLD
    );
  };

  const changeUIState = (state: UIState) => {
    switch (state) {
      case UIState.CORRECT:
        setInput(question!.answer);
        barRef.current?.clear();
        backgroundRef.current?.flashColor('bg-green-600');
        break;

      case UIState.INCORRECT:
        backgroundRef.current?.flashColor('bg-red-700');
        backgroundRef.current?.shakeContent();
        break;

      default:
        break;
    }
  };

  const updateResult = ({result, now}: {result: GuessResult; now: number}) => {
    setTimestamp(now);
    setResult(result);

    const {delta, points} = result;
    const totalTime = (score.totalTime += delta);

    setScore(prev => {
      return {
        ...prev,
        totalTime,
        guesses: prev.guesses.concat({
          elapsedTime: delta,
          score: points,
        }),
      };
    });
  };

  const setTimeouts = (points: number) => {
    setTimeout(() => {
      setScore(prev => {
        return {
          ...prev,
          totalScore: (prev.totalScore += points),
        };
      });
    }, GAME_OPTIONS.POINTS_UPDATE_TIMEOUT);

    if (!settings.autoPlay.status) return;

    setTimeout(() => {
      updateGameRound();
    }, GAME_OPTIONS.SONG_TIMEOUT);
  };

  const updateGameRound = () => {
    setInput('');
    setResult(undefined);
    setQuestionIndex(prev => (prev += 1));
  };

  const onPlayerReady = (e: ReactPlayer) => {
    if (!question) return;
    barRef.current?.setSongLength(e.getDuration());
    handleSongOffset();
    handlePlay();
  };

  const handleSongStart = () => {
    inputRef.current?.focus();
    setTimestamp(performance.now());
    barRef.current?.startAnimation();
  };

  const handleSongEnd = (showError: boolean = false) => {
    if (result) return;
    if (showError)
      ToastController.showErrorToast(
        'Song unable to play',
        'Youtube is currently not responding',
      );
    setInput(question!.answer);
    changeUIState(UIState.INCORRECT);
    barRef.current?.clear();
    const now = performance.now();
    const delta = (now - timestamp) / 1000;
    updateResult({result: {correct: false, delta, points: 0}, now});
    setTimeouts(0);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <PageContainer
      ref={backgroundRef}
      title={quizData?.title}
      description={quizData?.description}>
      <div className="w-full h-full flex flex-col">
        {quizData && (
          <GameDetailsContainer quiz={quizData} className="mt-2 -mb-28" />
        )}
        {gameState === GameState.PRE && (
          <PreGameScene
            quizId={quizId!}
            topScore={topScore}
            lastAttempt={lastAttempt}
            onChangeScene={(scene: GameState) => setGameState(scene)}
          />
        )}
        {gameState === GameState.POST && (
          <PostGameScene
            quizId={quizId!}
            onRestart={resetGame}
            lastAttempt={lastAttempt!}
            topScore={topScore}
            userData={quizData?.creator!}
          />
        )}
        {gameState === GameState.PLAYING && (
          <div className="flex flex-col h-full justify-between">
            {question && (
              <motion.div
                style={{pointerEvents: 'none'}}
                variants={{visible: {opacity: 1}, hidden: {opacity: 0}}}
                animate={result !== undefined ? 'visible' : 'hidden'}>
                <ReactPlayer
                  onBuffer={() => setIsLoading(true)}
                  onBufferEnd={() => setIsLoading(false)}
                  playing={isPlaying}
                  onReady={onPlayerReady}
                  onPlay={handleSongStart}
                  onError={() => handleSongEnd(true)}
                  controls={false}
                  width={'250%'}
                  height={'250%'}
                  className="absolute -left-[75%] -top-[75%] opacity-40"
                  onEnded={handleSongEnd}
                  ref={videoRef}
                  url={question.url}
                />
              </motion.div>
            )}

            {question && (
              <AnimatedResult
                className="absolute left-0 top-[24%]"
                question={question}
                result={result}
              />
            )}

            <div className="mx-[10%] z-10 my-auto space-y-4">
              <Heading
                size={'1'}
                weight={'regular'}
                className={UI.cn(
                  'text-white/90 text-center',
                  !settings.autoPlay.status && result
                    ? 'opacity-1'
                    : 'opacity-0',
                )}>
                (Press Enter to continue)
              </Heading>
              {isLoading && (
                <MusicLoader
                  className={UI.cn(
                    'opacity-1 absolute left-1/2 -translate-x-[50%] pb-4',
                  )}
                />
              )}
              <InputField
                trailing={
                  result === undefined &&
                  !isLoading && (
                    <div
                      onClick={() => handleSongEnd(false)}
                      className="mb-4 cursor-pointer flex items-center space-x-2 mr-4">
                      <Text size={'2'} className="text-white/50">
                        Skip
                      </Text>
                      <TrackNextIcon className="text-white/50" />
                    </div>
                  )
                }
                disabled={disableInput}
                showSimple
                onInput={handleInput}
                value={input.toUpperCase()}
                ref={inputRef}
                className="text-center font-bold mt-8 text-[30px]"
              />

              <QuizStatsContainer
                topScore={topScore}
                data={score}
                totalQuestion={quizData?.questions.length}
                className={UI.cn(
                  'mt-14 z-10',
                  isLoading ? 'opacity-30' : 'opacity-1',
                )}
              />
            </div>
          </div>
        )}

        <QuickOptionsContainer
          disabled={!!result}
          settings={settings}
          setSettings={setSettings}
        />
      </div>
    </PageContainer>
  );
}

export default PlayQuizScreen;
