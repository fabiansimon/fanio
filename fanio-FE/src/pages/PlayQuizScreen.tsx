import {useParams} from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactPlayer from 'react-player';
import {GuessResult, LocalScore, Quiz, Score} from '../types';
import {fetchPlayableQuizById} from '../utils/api';
import {shuffle} from 'lodash';
import Button from '../components/Button';
import {Heading, Text} from '@radix-ui/themes';
import {DateUtils, UI} from '../utils/common';
import {calculatePoints, similarity} from '../utils/logic';
import InputField from '../components/InputField';
import PostGameScene from '../components/PostGameScene';
import PreGameScene from '../components/PreGameScene';
import PointsBar, {PointsBarRef} from '../components/PointsBar';
import {LocalStorage} from '../utils/localStorage';
import AnimatedResult from '../components/AnimatedResult';
import {motion} from 'framer-motion';
import {GAME_OPTIONS} from '../constants/Game';
import AnimatedText from '../components/AnimatedText';

const ANIMATION_DURATION = 200;

const transition = {
  duration: ANIMATION_DURATION,
  type: 'spring',
  mass: 0.05,
};

interface ScoreState {
  totalScore: number;
  totalTime: number;
  guesses: Guess[];
}

interface Guess {
  elapsedTime: number; // in milliseconds
  score: number;
}

enum GameState {
  PRE,
  PLAYING,
  POST,
}

const ANSWER_THRESHOLD = 70;

const INIT_SCORE = {
  totalScore: 0,
  totalTime: 0,
  guesses: [],
};

function PlayQuizScreen(): JSX.Element {
  const {id} = useParams();

  const videoRef = useRef<ReactPlayer>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<PointsBarRef>(null);
  const backgroundRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState>(GameState.PLAYING);
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
    if (question?.startOffset) {
      videoRef.current?.seekTo(question.startOffset, 'seconds');
    }
  }, []);

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
    if (!input || !question?.answer || !videoRef.current) return;
    setInput('');

    // console.log(similarity(input, question?.answer)); // DEBUG ONLY

    const isCorrect = similarity(input, question?.answer) >= ANSWER_THRESHOLD;

    backgroundRef.current?.flashColor(
      isCorrect ? 'bg-green-600' : 'bg-red-700',
    );
    !isCorrect && backgroundRef.current?.shakeContent();

    const now = performance.now();
    const delta = (now - timestamp) / 1000;
    if (isCorrect) {
      const {points} = calculatePoints({
        length: videoRef.current?.getDuration(),
        delta,
      });

      setTimestamp(now);
      barRef.current?.clear();

      setScore(prev => {
        return {
          totalScore: (prev.totalScore += points),
          totalTime: (prev.totalTime += delta),
          guesses: prev.guesses.concat({
            elapsedTime: delta,
            score: points,
          }),
        };
      });
      setResult({correct: true, delta, points});
      setTimeout(() => {
        setResult(undefined);
        setQuestionIndex(prev => (prev += 1));
      }, GAME_OPTIONS.SONG_TIMEOUT);
      return;
    }
  };

  const onPlayerReady = (e: ReactPlayer) => {
    if (!question) return;
    barRef.current?.setSongLength(e.getDuration());
    if (question.startOffset) {
      videoRef.current?.seekTo(question.startOffset, 'seconds');
    }
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
              <PointsBar ref={barRef} />
              <InputField
                disabled={disableInput}
                showSimple
                onInput={handleInput}
                value={input}
                ref={inputRef}
                className="text-center text-[30px]"
              />

              <Button
                className="mt-4 w-full"
                text="Submit"
                hotkey="Enter"
                ignoreMetaKey
                disabled={disableInput}
                onClick={handleSubmitGuess}
              />
            </div>
            <InfoContainer
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

function InfoContainer({
  className,
  data,
  totalQuestion = 0,
  topScore,
}: {
  className?: string;
  data: ScoreState;
  topScore?: Score;
  totalQuestion?: number;
}): JSX.Element {
  const [score, setScore] = useState<number>(0);
  const {guesses, totalTime} = data;

  useEffect(() => {
    setTimeout(() => {
      setScore(data.totalScore);
    }, 1000);
  }, [data.totalScore]);

  return (
    <div className={UI.cn('flex flex-col w-full justify-between', className)}>
      {topScore && (
        <div className="flex justify-center">
          <div className="flex flex-col mb-4">
            <Text size={'2'} className="text-white/70 text-center">
              Score to beat
            </Text>
            <Heading size={'2'} className="text-white/70 text-center">
              {UI.formatPoints(topScore.totalScore)}
            </Heading>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center">
        <div className="flex w-full flex-grow flex-col">
          <Heading size={'4'} className="text-white">
            {guesses.length} out of {totalQuestion}
          </Heading>
          <Text size={'2'} className="text-white">
            Current Question
          </Text>
        </div>
        <div className="flex flex-grow w-full flex-col">
          <Heading size={'4'} className="text-white text-center">
            {UI.formatPoints(score)}
          </Heading>
          <Text size={'2'} className="text-white text-center">
            Points
          </Text>
        </div>
        <div className="flex w-full flex-grow flex-col">
          <Heading size={'4'} className="text-white text-right">
            {DateUtils.formatTime(totalTime)}
          </Heading>
          <Text size={'2'} className="text-white text-right">
            Total Time
          </Text>
        </div>
      </div>
    </div>
  );
}

export default PlayQuizScreen;
