import {Heading, Text} from '@radix-ui/themes';
import Button from './Button';
import {MinusIcon, PlusIcon} from '@radix-ui/react-icons';
import {useMemo} from 'react';
import {AchievementType, GameState, LocalScore, Score} from '../types';
import ScoreTile from './ScoreTile';
import {DateUtils, UI} from '../utils/common';
import EmptyContainer from './EmptyContainer';
import HoverContainer from './HoverContainer';

function PreGameScene({
  topScore,
  lastAttempt,
  onChangeScene,
}: {
  quizId: string;
  topScore?: Score;
  lastAttempt?: LocalScore;
  onChangeScene: (state: GameState) => void;
}): JSX.Element {
  const isWinner = useMemo(() => {
    if (!topScore || !lastAttempt) return false;
    return topScore?.totalScore < lastAttempt?.totalScore;
  }, [topScore, lastAttempt]);

  const {icon, textColor, backgroundColor} = useMemo(() => {
    return {
      textColor: isWinner ? 'text-green-700' : 'text-red-500',
      backgroundColor: isWinner ? 'bg-green-600/50' : 'bg-red-600/50',
      icon: isWinner ? (
        <MinusIcon className="text-green-500 size-4" />
      ) : (
        <PlusIcon className="text-red-500 size-4" />
      ),
    };
  }, [isWinner]);

  if (!topScore) {
    return (
      <EmptyContainer
        className="my-auto relative"
        title="Get the ball rolling ⚽️"
        description="Be the first one to submit a highscore">
        <Button
          onClick={() => onChangeScene(GameState.PLAYING)}
          hotkey="Enter"
          ignoreMetaKey
          text="Start Quiz"
          className="flex w-full mt-4"
          textSize="2"
        />
      </EmptyContainer>
    );
  }

  return (
    <>
      <HoverContainer className="my-auto px-4 py-4 relative mx-0 min-w-[400px] md:mx-auto">
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
                  <Heading weight={'medium'} className={textColor} size={'2'}>
                    {UI.formatPoints(
                      topScore.totalScore - lastAttempt.totalScore,
                    )}
                  </Heading>
                  <Text className={textColor} size={'2'} weight={'regular'}>
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
          onClick={() => onChangeScene(GameState.PLAYING)}
          hotkey="Enter"
          ignoreMetaKey
          text="Start Quiz"
          className="flex flex-grow w-full mt-4"
          textSize="2"
        />
      </HoverContainer>
    </>
  );
}

export default PreGameScene;
