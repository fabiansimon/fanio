import ReactPlayer from 'react-player';
import {Quiz, Score} from '../types';
import {useEffect, useMemo, useRef, useState} from 'react';
import {Button, Text, TextField} from '@radix-ui/themes';
import {useParams} from 'react-router-dom';
import {fetchQuizById, fetchScoresFromQuiz, uploadScore} from '../utils/api';
import {shuffle, similarity} from '../utils/logic';
import useKeyShortcut from '../hooks/useKeyShortcut';

const ANSWER_THRESHOLD = 80;

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
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [scores, setScores] = useState<Score[]>([]);

  const [score, setScore] = useState<ScoreState>({
    totalScore: 0,
    totalTime: 0,
    guesses: [],
  });
  const [input, setInput] = useState<string>('');

  const isEnd = useMemo(
    () => score.guesses.length >= quizData?.questions.length!,
    [score, quizData],
  );
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
        console.log(error);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (isEnd) {
      (async () => uploadGameScore())();
      (async () => getQuizScores())();
    }
  }, [isEnd]);

  const uploadGameScore = async () => {
    try {
      if (!id) return;
      const {totalScore, totalTime} = score;
      await uploadScore({
        totalScore,
        timeElapsed: totalTime,
        userName: 'NEWWW',
        quizId: id,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getQuizScores = async () => {
    try {
      if (!id) return;
      const res = await fetchScoresFromQuiz(id);
      console.log(res);
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
    <div className="flex space-y-2 flex-col text-rightl w-full h-screen bg-slate-500 items-center justify-center">
      <Text>{quizData?.title}</Text>
      <Text>{quizData?.description}</Text>
      <Text>{score.totalScore}</Text>
      {question && (
        <>
          <ReactPlayer
            playing={isPlaying}
            onReady={() => {
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
          <TextField.Input
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
            key={i}>{`${s.userName}: ${s.totalScore} ${s.timeElapsed}`}</Text>
        ))}
      {!isEnd && <Button onClick={handleSubmitGuess}>Guess</Button>}
      {!isPlaying && !isEnd && <Button onClick={handlePlay}>Play</Button>}
      {isEnd && <Button onClick={restartGame}>Restart</Button>}
    </div>
  );
}

export default PlayScreen;
