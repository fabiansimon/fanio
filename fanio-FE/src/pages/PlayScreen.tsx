import ReactPlayer from 'react-player';
import {useEffect, useMemo, useRef, useState} from 'react';
import {Quiz, Score} from '../types';
import {motion, useAnimation} from 'framer-motion';
import {Heading, Text} from '@radix-ui/themes';
import Button from '../components/Button';
import {useParams} from 'react-router-dom';
import {fetchQuizById, fetchScoresFromQuiz, uploadScore} from '../utils/api';
import {shuffle, similarity} from '../utils/logic';
import useKeyShortcut from '../hooks/useKeyShortcut';
import {LocalStorage} from '../utils/localStorage';
import InputField from '../components/InputField';
import PointsBar from '../components/PointsBar';
import {UI} from '../utils/common';

const ANSWER_THRESHOLD = 70;

interface ScoreState {
  totalScore: number;
  totalTime: number;
  guesses: Guess[];
}

interface Guess {
  elapsedTime: number; // in milliseconds
  score: number;
}

function PlayScreen(): JSX.Element {
  const {id} = useParams();

  const playerRef = useRef<ReactPlayer>(null);
  const barRef = useRef<any>(null);
  const inputRef = useRef<any>(null);

  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [scores, setScores] = useState<Score[]>([]);
  const [input, setInput] = useState<string>('');

  const [score, setScore] = useState<ScoreState>({
    totalScore: 0,
    totalTime: 0,
    guesses: [],
  });

  const isEnd = useMemo(
    () => score.guesses.length >= quizData?.questions.length!,
    [score, quizData],
  );

  const runningGame = useMemo(() => {
    return !isEnd && isPlaying;
  }, [isPlaying, isEnd]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [runningGame]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetchQuizById(id);
        setQuizData({
          ...res,
          questions: shuffle(res.questions),
        });
      } catch (error) {
        console.error(error);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (isEnd) {
      barRef.current?.clear();
      (async () => uploadGameScore())();
      (async () => getQuizScores())();
    }
  }, [isEnd]);

  const uploadGameScore = async () => {
    try {
      if (!id) return;
      const {totalScore, totalTime} = score;
      const {id: scoreId} = await uploadScore({
        totalScore,
        timeElapsed: totalTime,
        userName: 'Julia',
        quizId: id,
      });
      LocalStorage.saveScoreId(scoreId);
    } catch (error) {
      console.log(error);
    }
  };

  const getQuizScores = async () => {
    try {
      if (!id) return;
      const res = await fetchScoresFromQuiz(id);
      setScores(res);
    } catch (error) {
      console.error(error);
    }
  };

  const question = useMemo(() => {
    if (quizData) return quizData.questions[questionIndex];

    return null;
  }, [quizData, questionIndex]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handlePlay = () => {
    if (!isPlaying) setIsPlaying(true);
    if (question?.startOffset) {
      playerRef.current?.seekTo(question.startOffset, 'seconds');
    }
  };

  const handleSubmitGuess = () => {
    if (!input || !question?.answer) return;

    console.log(similarity(input, question?.answer)); // DEBUG ONLY

    const isCorrect = similarity(input, question?.answer) >= ANSWER_THRESHOLD;
    setInput('');

    const delta =
      (playerRef.current?.getCurrentTime() || 0) - (question?.startOffset || 0);
    const points = playerRef.current?.getDuration()! - delta;

    if (isCorrect) {
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
      setQuestionIndex(prev => (prev += 1));
      setIsPlaying(false);
      return;
    }
  };

  const restartGame = () => {
    setInput('');
    setQuizData(prev => {
      if (!prev) return null;
      return {...prev, question: shuffle(prev.questions)};
    });
    setScore({totalScore: 0, totalTime: 0, guesses: []});
    setQuestionIndex(0);
    handlePlay();
  };

  useKeyShortcut('Enter', () => {
    if (isEnd) return restartGame();
    if (questionIndex === 0 && !isPlaying) return handlePlay();
    handleSubmitGuess();
  });

  return (
    <div className="flex space-y-2 flex-col w-full h-screen bg-slate-900 items-center justify-center">
      <div className="w-full px-20 flex flex-col">
        <Heading size={'4'} className="text-white">
          {quizData?.title}
        </Heading>
        <Text size={'2'} className="text-white">
          {quizData?.description}
        </Text>
        <Text>{score.totalScore}</Text>
        <PointsBar
          ref={barRef}
          className={UI.cn('mb-2', !runningGame && 'h-0')}
        />
        {question && (
          <>
            <ReactPlayer
              playing={isPlaying}
              onReady={e => {
                setIsReady(true);
                barRef.current?.startAnimation(e.getDuration());
                if (questionIndex === 0) return;
                if (question.startOffset) {
                  playerRef.current?.seekTo(question.startOffset, 'seconds');
                }
                handlePlay();
              }}
              controls
              width={0}
              height={0}
              ref={playerRef}
              url={question.url}
            />
            <InputField
              ref={inputRef}
              value={input}
              onInput={handleInput}
              placeholder="Enter name of Song"
            />
          </>
        )}
        {isEnd &&
          scores.length > 0 &&
          scores.map((s, i) => (
            <Text
              className="text-white"
              key={i}>{`${s.userName}: ${s.totalScore} ${s.timeElapsed}`}</Text>
          ))}
        <div className="mt-2 flex justify-center">
          {!isEnd && !isPlaying && isReady ? (
            <Button hotkey="Enter" onClick={handlePlay}>
              Play
            </Button>
          ) : (
            <Button hotkey="Enter" onClick={handleSubmitGuess}>
              Guess
            </Button>
          )}
        </div>
        {isEnd && <Button onClick={restartGame}>Restart</Button>}
      </div>
    </div>
  );
}

export default PlayScreen;
