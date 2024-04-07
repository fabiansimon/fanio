import {Heading, Text} from '@radix-ui/themes';
import Button from './Button';
import {MinusIcon, PlusIcon} from '@radix-ui/react-icons';
import {useMemo} from 'react';
import {AchievementType, LocalScore, Score} from '../types';
import ScoreTile from './ScoreTile';
import {DateUtils, UI} from '../utils/common';

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

export default PreGameScene;
