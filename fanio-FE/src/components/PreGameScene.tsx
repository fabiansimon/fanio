import {Heading, Text} from '@radix-ui/themes';
import Button from './Button';
import {MinusIcon, PlusIcon} from '@radix-ui/react-icons';
import {useMemo} from 'react';
import {AchievementType, LocalScore, Score} from '../types';
import ScoreTile from './ScoreTile';
import {DateUtils, UI} from '../utils/common';
import EmptyContainer from './EmptyContainer';

function PreGameScene({
  topScore,
  lastAttempt,
  onStart,
}: {
  topScore?: Score;
  lastAttempt?: LocalScore;
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

  if (!topScore)
    return (
      <EmptyContainer
        className="my-auto"
        title="Get the ball rolling ⚽️"
        description="Be the first one to submit a highscore">
        <Button
          onClick={onStart}
          hotkey="Enter"
          ignoreMetaKey
          text="Start Quiz"
          className="flex flex-grow w-full mt-4"
          textSize="2"
        />
      </EmptyContainer>
    );

  return (
    <div className="flex flex-col my-auto bg-black/20 border shadow-md shadow-black rounded-lg px-4 py-4 mx-[20%] border-neutral-500/20  items-center justify-center">
      <div className="space-y-3 w-full -mt-1">
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
                <Heading weight={'bold'} className={textColor} size={'3'}>
                  {UI.formatPoints(
                    topScore.totalScore - lastAttempt.totalScore,
                  )}
                </Heading>
                <Text className={textColor} size={'2'} weight={'medium'}>
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
      <Button
        onClick={onStart}
        hotkey="Enter"
        ignoreMetaKey
        text="Start Quiz"
        className="flex flex-grow w-full mt-4"
        textSize="2"
      />
    </div>
  );
}

export default PreGameScene;
