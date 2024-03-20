import {useParams} from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import {useEffect, useMemo, useRef, useState} from 'react';
import ReactPlayer from 'react-player';
import {Quiz} from '../types';
import {fetchQuizById} from '../utils/api';
import {shuffle} from 'lodash';
import Button from '../components/Button';
import {Heading, Text} from '@radix-ui/themes';
import {DateUtils, UI} from '../utils/common';
import {similarity} from '../utils/logic';

interface ScoreState {
  totalScore: number;
  totalTime: number;
  guesses: Guess[];
}

interface Guess {
  elapsedTime: number; // in milliseconds
  score: number;
}

const ANSWER_THRESHOLD = 70;

function PlayQuizScreen({}): JSX.Element {
  const {id} = useParams();

  const videoRef = useRef<ReactPlayer>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [input, setInput] = useState<string>('');
  const [score, setScore] = useState<ScoreState>({
    totalScore: 0,
    totalTime: 0,
    guesses: [],
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  const question = useMemo(() => {
    if (quizData) return quizData.questions[questionIndex];

    return null;
  }, [quizData, questionIndex]);

  const handlePlay = () => {
    if (!isPlaying) setIsPlaying(true);
    if (question?.startOffset) {
      videoRef.current?.seekTo(question.startOffset, 'seconds');
    }
  };

  const handleSubmitGuess = () => {
    if (!input || !question?.answer) return;

    console.log(similarity(input, question?.answer)); // DEBUG ONLY

    const isCorrect = similarity(input, question?.answer) >= ANSWER_THRESHOLD;
    setInput('');

    const delta =
      (videoRef.current?.getCurrentTime() || 0) - (question?.startOffset || 0);
    const points = videoRef.current?.getDuration()! - delta;

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
      return;
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <PageContainer title={quizData?.title} description={quizData?.description}>
      <div className="w-full h-full flex flex-col justify-between">
        {question && (
          <ReactPlayer
            playing={isPlaying}
            // onReady={e => {
            // setIsReady(true);
            // barRef.current?.startAnimation(e.getDuration());
            // if (questionIndex === 0) return;
            // if (question.startOffset) {
            //   videoRef.current?.seekTo(question.startOffset, 'seconds');
            // }
            // handlePlay();
            // }}
            controls
            width={0}
            height={0}
            ref={videoRef}
            url={question.url}
          />
        )}
        <div className="px-[10%]">
          <input
            onInput={handleInput}
            value={input}
            ref={inputRef}
            type="text"
            className="relative bg-transparent flex w-full text-[36px] text-white font-medium text-center
        focus:outline-none focus:border-b focus:border-white border-b-2 border-b-white/10 placeholder-neutral-600"
            placeholder="Answer here"
          />

          <Button
            className="mt-4 w-full"
            text="Submit"
            hotkey="Enter"
            ignoreMetaKey
            onClick={handleSubmitGuess}
          />
          {!isPlaying && (
            <Button
              className="mt-4 w-full"
              text="Submit"
              hotkey="ö"
              ignoreMetaKey
              onClick={handlePlay}
            />
          )}
        </div>
        <InfoContainer
          data={score}
          totalQuestion={quizData?.questions.length}
          className="mt-14"
        />
      </div>
    </PageContainer>
  );
}

function InfoContainer({
  className,
  data,
  totalQuestion = 0,
}: {
  className?: string;
  data: ScoreState;
  totalQuestion?: number;
}): JSX.Element {
  const {totalScore, totalTime, guesses} = data;
  return (
    <div className={UI.cn('flex w-full justify-between', className)}>
      <div className="flex flex-col">
        <Heading size={'4'} className="text-white">
          {guesses.length} out of {totalQuestion}
        </Heading>
        <Text size={'2'} className="text-white">
          Current Question
        </Text>
      </div>
      <div className="flex flex-col">
        <Heading size={'4'} className="text-white text-center">
          {DateUtils.formatSeconds(totalTime, 'sec')}
        </Heading>
        <Text size={'2'} className="text-white text-center">
          Total Time
        </Text>
      </div>
      <div className="flex flex-col">
        <Heading size={'4'} className="text-white text-right">
          {UI.formatPoints(totalScore)}
        </Heading>
        <Text size={'2'} className="text-white text-right">
          Points
        </Text>
      </div>
    </div>
  );
}

export default PlayQuizScreen;
