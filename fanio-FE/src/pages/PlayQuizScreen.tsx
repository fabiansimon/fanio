import {useParams} from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactPlayer from 'react-player';
import {GuessResult, LocalScore, Quiz, Score, ScoreState} from '../types';
import {fetchPlayableQuizById} from '../utils/api';
import {shuffle} from 'lodash';
import {calculatePoints, randomNumber, similarity} from '../utils/logic';
import InputField from '../components/InputField';
import PostGameScene from '../components/PostGameScene';
import PreGameScene from '../components/PreGameScene';
import PointsBar, {PointsBarRef} from '../components/PointsBar';
import {LocalStorage} from '../utils/localStorage';
import AnimatedResult from '../components/AnimatedResult';
import {motion} from 'framer-motion';
import {GAME_OPTIONS} from '../constants/Game';
import QuizStatsContainer from '../components/QuizStatsContainer';
import useKeyShortcut from '../hooks/useKeyShortcut';

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

function PlayQuizScreen(): JSX.Element {
  useKeyShortcut(
    'Enter',
    () => {
      if (!isPlaying || result || gameState !== GameState.PLAYING) return;
      changeUIState(UIState.INCORRECT);
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

  const question = useMemo(() => {
    if (quizData) return quizData.questions[questionIndex];

    return null;
  }, [quizData, questionIndex]);

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
      offset = randomNumber({min: 10, max: videoRef.current.getDuration()});
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
    handleSubmitGuess();
  }, [input]);

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

  const handleSubmitGuess = () => {
    if (!isValidInput()) return;

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

    setTimeout(() => {
      setInput('');
      setResult(undefined);
      setQuestionIndex(prev => (prev += 1));
    }, GAME_OPTIONS.SONG_TIMEOUT);
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
    setResult(prev => {
      if (!prev) return;
      return {...prev, correct: false};
    });
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

            <div className="mx-[10%] z-10">
              {/* <PointsBar ref={barRef} /> */}
              <InputField
                disabled={disableInput}
                showSimple
                onInput={handleInput}
                value={input}
                ref={inputRef}
                className="text-center text-[30px]"
              />

              {/* <Button
                className="mt-4 w-full"
                text="Submit"
                hotkey="Enter"
                ignoreMetaKey
                disabled={disableInput}
                onClick={handleSubmitGuess}
              /> */}
            </div>
            <QuizStatsContainer
              topScore={topScore}
              data={score}
              totalQuestion={quizData?.questions.length}
              className="mt-14 z-10"
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default PlayQuizScreen;
