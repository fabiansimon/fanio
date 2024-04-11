import {useParams} from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactPlayer from 'react-player';
import {
  GameSettingKey,
  GameSettings,
  GuessResult,
  LocalScore,
  Quiz,
  Score,
  ScoreState,
} from '../types';
import {fetchPlayableQuizById} from '../utils/api';
import {shuffle} from 'lodash';
import {calculatePoints, randomNumber, similarity} from '../utils/logic';
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
import {Checkbox, Heading, Text} from '@radix-ui/themes';
import KeyBinding from '../components/KeyBinding';
import {UI} from '../utils/common';

enum GameState {
  PRE,
  PLAYING,
  POST,
}

enum UIState {
  CORRECT,
  INCORRECT,
}

const ANSWER_THRESHOLD = 70;

const INIT_SCORE = {
  totalScore: 0,
  totalTime: 0,
  guesses: [],
};

const INIT_GAME_SETTINGS = {
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
  const {id} = useParams();

  const videoRef = useRef<ReactPlayer>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const barRef = useRef<PointsBarRef>(null);
  const backgroundRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState>(GameState.PRE);
  const [questionIndex, setQuestionIndex] = useState<number>(0);

  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [topScore, setTopScore] = useState<Score | undefined>();
  const [lastAttempt, setLastAttempt] = useState<LocalScore | undefined>();

  const [input, setInput] = useState<string>('');
  const [score, setScore] = useState<ScoreState>(INIT_SCORE);
  const [timestamp, setTimestamp] = useState<number>(0);

  const [result, setResult] = useState<GuessResult | undefined>();
  const [settings, setSettings] = useState<GameSettings>(
    LocalStorage.fetchUserSettings() || INIT_GAME_SETTINGS,
  );

  const question = useMemo(() => {
    if (quizData) return quizData.questions[questionIndex];

    return null;
  }, [quizData, questionIndex]);
  console.log(question);

  const disableInput = useMemo(
    () => result !== undefined || !isPlaying,
    [result, isPlaying],
  );

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
      const boundary = videoRef.current.getDuration() * 0.1;
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

  const lastStoredAttempt = useMemo(
    () => LocalStorage.fetchLastAttempt(id!),
    [id],
  );

  useEffect(() => {
    LocalStorage.saveUserSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (settings.autoInput.status) handleSubmitGuess();
  }, [input, settings]);

  useEffect(() => {
    if (questionIndex === quizData?.questions.length) {
      const _lastAttempt: LocalScore = {
        createdAt: new Date(),
        quizId: id!,
        timeElapsed: score.totalTime,
        totalScore: score.totalScore,
        isUploaded: false,
      };
      LocalStorage.saveLastAttempt(id!, _lastAttempt!);
      setLastAttempt(_lastAttempt);
      setGameState(GameState.POST);
    }
  }, [
    questionIndex,
    score.totalScore,
    score.totalTime,
    quizData?.questions,
    id,
  ]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const {quiz, topScore} = await fetchPlayableQuizById({id});
        setQuizData({
          ...quiz,
          questions: shuffle(quiz.questions),
        });
        setTopScore(topScore);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [id]);

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

    updateResult(now, delta, points);

    setTimeouts(points);
  };

  const isValidInput = () => {
    return (
      input &&
      question &&
      videoRef.current &&
      !result &&
      Math.abs(question.answer.length - input.length) <= 2 &&
      similarity(input, question!.answer) > ANSWER_THRESHOLD
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

  const updateResult = (now: number, delta: number, points: number) => {
    setTimestamp(now);
    setResult({correct: true, delta, points});
    setScore(prev => {
      return {
        ...prev,
        totalTime: (prev.totalTime += delta),
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

  const handleSongEnd = () => {
    if (result) return;
    changeUIState(UIState.INCORRECT);
    setResult({correct: false, delta: 0, points: 0});
    barRef.current?.clear();
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
        {gameState === GameState.PRE && (
          <PreGameScene
            topScore={topScore}
            lastAttempt={lastAttempt || lastStoredAttempt}
            onStart={() => setGameState(GameState.PLAYING)}
          />
        )}
        {gameState === GameState.POST && (
          <PostGameScene
            quizId={id!}
            onRestart={resetGame}
            lastAttempt={lastAttempt!}
            topScore={topScore}
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
                  playing={isPlaying}
                  onReady={onPlayerReady}
                  onPlay={handleSongStart}
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
                className="absolute left-0 top-[22%]"
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
              {/* <PointsBar ref={barRef} /> */}
              <InputField
                disabled={disableInput}
                showSimple
                onInput={handleInput}
                value={input.toUpperCase()}
                ref={inputRef}
                className="text-center font-bold text-[30px]  "
              />
              <QuizStatsContainer
                topScore={topScore}
                data={score}
                totalQuestion={quizData?.questions.length}
                className="mt-14 z-10"
              />
            </div>
          </div>
        )}
        <QuickOptionsContainer settings={settings} setSettings={setSettings} />
      </div>
    </PageContainer>
  );
}

function QuickOptionsContainer({
  settings,
  setSettings,
}: {
  settings: GameSettings;
  setSettings: Dispatch<SetStateAction<GameSettings>>;
}): JSX.Element {
  const handleChange = (key: GameSettingKey, value: boolean) => {
    setSettings(prev => {
      return {
        ...prev,
        [key]: {
          ...prev[key],
          status: value,
        },
      };
    });
  };

  return (
    <div className="flex justify-between">
      {Object.entries(settings).map(
        ([key, {title, description, status}], index) => {
          const optionKey = key as GameSettingKey;
          return (
            <div className="flex justify-center space-x-2 px-3" key={key}>
              <Checkbox
                checked={status}
                style={{opacity: status || 0.2}}
                size={'1'}
                onCheckedChange={value =>
                  handleChange(optionKey, value as boolean)
                }
              />
              <div className="flex flex-col -mt-1.5">
                <div className="space-x-1.5 mb-1">
                  <Text size={'2'} weight={'medium'} className="text-white/90">
                    {title}
                  </Text>
                  <KeyBinding
                    className="size-2 mt-1"
                    textClassName="text-[10px]"
                    hotkey={['C', 'J', 'B'][index]}
                    onActivate={() => handleChange(optionKey, !status)}
                  />
                </div>
                <Text size={'1'} className="text-white/50">
                  {description}
                </Text>
              </div>
            </div>
          );
        },
      )}
    </div>
  );
}
export default PlayQuizScreen;
