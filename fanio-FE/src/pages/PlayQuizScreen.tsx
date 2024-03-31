import {useParams} from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactPlayer from 'react-player';
import {AchievementType, ButtonType, Quiz, Score} from '../types';
import {fetchPlayableQuizById, uploadScore} from '../utils/api';
import {shuffle} from 'lodash';
import {motion} from 'framer-motion';
import Button from '../components/Button';
import {Heading, Text} from '@radix-ui/themes';
import {DateUtils, UI} from '../utils/common';
import {rateScore, similarity} from '../utils/logic';
import ScoreTile from '../components/ScoreTile';
import {CheckIcon, MinusIcon, PlusIcon} from '@radix-ui/react-icons';
import InputField from '../components/InputField';
import {LocalStorage} from '../utils/localStorage';
import {GAME_OPTIONS} from '../constants/Game';

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

function PlayQuizScreen({}): JSX.Element {
  const {id} = useParams();

  const videoRef = useRef<ReactPlayer>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState>(GameState.PRE);
  const [questionIndex, setQuestionIndex] = useState<number>(0);

  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [topScore, setTopScore] = useState<Score | undefined>();
  const [lastAttempt, setLastAttempt] = useState<Score | undefined>({
    createdAt: new Date(),
    quizId: id!,
    id: '1',
    timeElapsed: 100,
    totalScore: 320,
    userName: 'Last Attempt',
  });

  const [input, setInput] = useState<string>('');
  const [score, setScore] = useState<ScoreState>(INIT_SCORE);

  const question = useMemo(() => {
    if (quizData) return quizData.questions[questionIndex];

    return null;
  }, [quizData, questionIndex]);

  const handlePlay = useCallback(() => {
    if (!isPlaying) setIsPlaying(true);
    if (question?.startOffset) {
      videoRef.current?.seekTo(question.startOffset, 'seconds');
    }
  }, []);

  const resetGame = useCallback(() => {
    setLastAttempt({
      createdAt: new Date(),
      id: '',
      quizId: '',
      timeElapsed: score.totalTime,
      totalScore: score.totalScore,
      userName: 'Last attempt',
    });
    setScore(INIT_SCORE);
    setGameState(GameState.PRE);
  }, []);

  useEffect(() => {
    if (questionIndex === quizData?.questions.length) resetGame();
  }, [questionIndex, quizData?.questions, resetGame]);

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
          handlePlay();
        }, 1000);
        break;

      default:
        break;
    }
  }, [gameState, inputRef, handlePlay]);

  const handleSubmitGuess = () => {
    if (!input || !question?.answer) return;

    console.log(similarity(input, question?.answer)); // DEBUG ONLY

    const isCorrect = similarity(input, question?.answer) >= ANSWER_THRESHOLD;
    setInput('');

    const delta = videoRef.current?.getCurrentTime() || 0;
    // (videoRef.current?.getCurrentTime() || 0) - (question?.startOffset || 0);
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
        {gameState === GameState.POST && (
          <PostGameScene
            quizId={id!}
            onRestart={() => console.log('helo')}
            lastAttempt={lastAttempt!}
            topScore={topScore}
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

  const {icon, textColor, backgroundColor} = useMemo(() => {
    return {
      textColor: isWinner ? 'text-green-700' : 'text-red-500',
      backgroundColor: isWinner ? 'bg-green-600' : 'bg-red-600',
      icon: isWinner ? (
        <MinusIcon className="text-white size-4" />
      ) : (
        <PlusIcon className="text-white size-4" />
      ),
    };
  }, [isWinner]);

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
              <div className="flex items-center justify-end relative">
                <div className="flex flex-col text-right ml-2">
                  <Heading weight={'medium'} className={textColor} size={'3'}>
                    {UI.formatPoints(
                      topScore.totalScore - lastAttempt.totalScore,
                    )}
                  </Heading>
                  <Text className={textColor} size={'2'}>
                    {DateUtils.formatTime(
                      Math.abs(topScore.timeElapsed - lastAttempt.timeElapsed),
                      'sec',
                    )}
                  </Text>
                </div>
                <div
                  className={UI.cn(
                    'absolute -right-11 flex size-5 ml-3 items-center justify-center rounded-full',
                    backgroundColor,
                  )}>
                  {icon}
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
function PostGameScene({
  topScore,
  lastAttempt,
  onRestart,
  quizId,
}: {
  topScore?: Score;
  lastAttempt: Score;
  quizId: string;
  onRestart: () => void;
}): JSX.Element {
  const ANIMATION_DURATION = 0.15; // in secon
  const transition = {
    duration: ANIMATION_DURATION,
    type: 'spring',
    mass: 0.05,
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [attempt, setAttempt] = useState<Score>({...lastAttempt, userName: ''});

  const uploadGameScore = async () => {
    setIsLoading(true);
    try {
      const {totalScore, timeElapsed, userName} = attempt;
      const {id: scoreId} = await uploadScore({
        totalScore,
        timeElapsed,
        userName,
        quizId,
      });
      LocalStorage.saveScoreId(scoreId);
      setIsUploaded(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const {title, subtitle} = useMemo(() => {
    const {POST_GAME_SUBTITLES, POST_GAME_TITLES} = GAME_OPTIONS;
    if (!topScore)
      return {
        title: POST_GAME_TITLES[2],
        subtitle: POST_GAME_SUBTITLES[2],
      };

    const {totalScore: _currScore} = lastAttempt;
    const {totalScore: _topScore} = topScore;

    const rating = rateScore(_currScore, _topScore);
    return {
      title: POST_GAME_TITLES[rating],
      subtitle: POST_GAME_SUBTITLES[rating],
    };
  }, [lastAttempt, topScore]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttempt(prev => {
      return {
        ...prev,
        userName: e.target.value,
      };
    });
  };

  return (
    <div className="mx-[10%] my-auto space-y-3">
      <div>
        <Heading size={'8'} className="text-white -rotate-3 pb-3">
          {title}
        </Heading>
        <Text size={'4'} className="text-white/80">
          {subtitle}
        </Text>
      </div>
      <div className="border border-white/20 overflow-hidden rounded-lg py-3 px-3">
        <ScoreTile
          score={attempt.userName ? attempt : lastAttempt}
          position={3}
        />
        <div className="relative">
          <motion.div
            animate={!isUploaded ? 'hidden' : 'shown'}
            variants={{shown: {x: 0}, hidden: {x: -1000}}}
            transition={transition}
            className="absolute flex bg-green-400/30 rounded-xl h-11 w-full items-center justify-center space-x-2">
            <CheckIcon className="text-green-300 size-5" />
            <Text size={'2'} weight={'medium'} className="text-green-300">
              Successfully uploaded
            </Text>
          </motion.div>
          <motion.div
            transition={transition}
            variants={{shown: {x: 0}, hidden: {x: 1000}}}
            animate={isUploaded ? 'hidden' : 'shown'}
            className="flex space-x-2 h-11 mt-4">
            <InputField
              disabled={isLoading}
              maxLength={GAME_OPTIONS.MAX_SCORE_USERNAME_LENGTH}
              value={attempt.userName}
              onInput={handleInput}
              placeholder="Enter your name"
              className="flex"
            />
            <Button
              type={ButtonType.outline}
              text="Upload Score"
              textSize="2"
              loading={isLoading}
              onClick={uploadGameScore}
              className="flex w-1/2"
              disabled={attempt.userName.trim().length === 0}
            />
          </motion.div>
        </div>
      </div>
      <Button
        text="Start Quiz"
        className="mx-auto mt-4"
        hotkey="Enter"
        onClick={onRestart}
        ignoreMetaKey
      />
    </div>
  );
}

export default PlayQuizScreen;
