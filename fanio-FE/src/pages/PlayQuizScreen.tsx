import {useParams} from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactPlayer from 'react-player';
import {AchievementType, Quiz, Score} from '../types';
import {fetchPlayableQuizById} from '../utils/api';
import {shuffle} from 'lodash';
import Button from '../components/Button';
import {Heading, Text} from '@radix-ui/themes';
import {DateUtils, UI} from '../utils/common';
import {similarity} from '../utils/logic';
import ScoreTile from '../components/ScoreTile';
import {MinusIcon, PlusIcon} from '@radix-ui/react-icons';
import InputField from '../components/InputField';

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

const res = {
  createdAt: new Date(),
  quizId: 'id'!,
  userName: 'Last attempt',
  timeElapsed: 29,
  totalScore: 239,
  id: '',
};

function PlayQuizScreen({}): JSX.Element {
  const {id} = useParams();

  const videoRef = useRef<ReactPlayer>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState>(GameState.PRE);
  const [questionIndex, setQuestionIndex] = useState<number>(0);

  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [topScore, setTopScore] = useState<Score | undefined>();
  const [lastAttempt, setLastAttempt] = useState<Score | undefined>();

  const [input, setInput] = useState<string>('');
  const [score, setScore] = useState<ScoreState>({
    totalScore: 0,
    totalTime: 0,
    guesses: [],
  });

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

  useEffect(() => {
    switch (gameState) {
      case GameState.PLAYING:
        setTimeout(() => {
          console.log('hello world');
          handlePlay();
          inputRef.current?.focus();
        }, 1000);
        break;

      default:
        break;
    }
  }, [gameState, inputRef]);

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
      <div className="w-full h-full flex flex-col">
        {gameState === GameState.PRE && (
          <PreGameScene
            topScore={topScore}
            lastAttempt={lastAttempt}
            onStart={() => setGameState(GameState.PLAYING)}
          />
        )}
        {gameState === GameState.PLAYING && (
          <div className="flex flex-col h-full justify-between">
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
            <div className="mx-[10%]">
              <InputField
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
                onClick={handleSubmitGuess}
              />
            </div>
            <InfoContainer
              data={score}
              totalQuestion={quizData?.questions.length}
              className="mt-14"
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

function PreGameScene({
  topScore,
  lastAttempt,
  onStart,
}: {
  topScore?: Score;
  lastAttempt?: Score;
  onStart: () => void;
}): JSX.Element {
  const isWinner = useMemo(() => {
    if (!topScore || !lastAttempt) return false;
    return topScore?.totalScore < lastAttempt?.totalScore;
  }, [topScore, lastAttempt]);

  return (
    <div className="border border-white/20 rounded-lg py-3 px-3 mx-[10%] my-auto">
      {topScore ? (
        <div className="space-y-3 -mt-1">
          <Heading className="text-white" size={'3'}>
            Highscore to beat
          </Heading>
          <ScoreTile
            score={topScore}
            achievement={AchievementType.FIRST}
            position={1}
          />
          {lastAttempt && (
            <div className="space-y-2">
              <ScoreTile score={lastAttempt} />
              <div className="w-full border-[.2px] border-white/30" />
              <div className="flex items-center justify-end">
                <div
                  className={UI.cn(
                    'flex size-5 items-center justify-center rounded-full',
                    isWinner ? 'bg-green-500' : 'bg-red-600',
                  )}>
                  {isWinner ? (
                    <PlusIcon className="text-white size-4" />
                  ) : (
                    <MinusIcon className="text-white size-4" />
                  )}
                </div>
                <div className="flex flex-col text-right ml-2">
                  <Heading weight={'medium'} className="text-white" size={'3'}>
                    {UI.formatPoints(
                      topScore.totalScore - lastAttempt.totalScore,
                    )}
                  </Heading>
                  <Text className="text-white/70" size={'2'}>
                    {DateUtils.formatTime(
                      topScore.timeElapsed - lastAttempt.timeElapsed,
                      'sec',
                    )}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="px-auto w-full items-center flex flex-col">
          <Heading className="text-white" size={'3'}>
            Get the ball rolling
          </Heading>
          <Text className="text-white/70" size={'2'}>
            by setting a new highscore
          </Text>
        </div>
      )}
      <Button
        text="Start Quiz"
        className="mx-auto mt-4"
        hotkey="Enter"
        onClick={onStart}
        ignoreMetaKey
      />
    </div>
  );
}

export default PlayQuizScreen;
