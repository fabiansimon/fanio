import {useEffect, useState} from 'react';
import {Score, ScoreState} from '../types';
import {GAME_OPTIONS} from '../constants/Game';
import {Heading, Text} from '@radix-ui/themes';
import {DateUtils, UI} from '../utils/common';

function QuizStatsContainer({
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
  const {guesses, totalTime, totalScore} = data;

  useEffect(() => {
    if (score >= totalScore) return;

    const intervalDuration =
      GAME_OPTIONS.SONG_TIMEOUT / GAME_OPTIONS.MAX_POINTS_PER_ROUND;

    const interval = setInterval(() => {
      setScore(prev => prev + 1);
    }, 1);

    return () => clearInterval(interval);
  }, [score, totalScore]);

  return (
    <div
      className={UI.cn(
        'flex flex-col w-full justify-between space-y-3',
        className,
      )}>
      <div className="flex justify-between">
        <div className="flex w-full flex-grow flex-col">
          <Heading size={'3'} className="text-white">
            {guesses.length} out of {totalQuestion}
          </Heading>
          <Text size={'1'} className="text-white/70">
            Current Question
          </Text>
        </div>
        <div className="flex flex-grow w-full flex-col">
          <Heading size={'3'} className="text-white text-center">
            {UI.formatPoints(score)}
          </Heading>
          <Text size={'1'} className="text-white/70 text-center">
            Points
          </Text>
        </div>
        <div className="flex w-full flex-grow flex-col">
          <Heading size={'3'} className="text-white text-right">
            {DateUtils.formatTime(totalTime)}
          </Heading>
          <Text size={'1'} className="text-white/70 text-right">
            Total Time
          </Text>
        </div>
      </div>
      {topScore && (
        <div className="flex justify-center">
          <div className="flex flex-col">
            <Text size={'1'} className="text-white/70 text-center">
              Score to beat
            </Text>
            <Heading size={'2'} className="text-white/70 text-center">
              {UI.formatPoints(topScore.totalScore)}
            </Heading>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizStatsContainer;
