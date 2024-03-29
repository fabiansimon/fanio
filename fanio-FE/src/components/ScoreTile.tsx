import {Heading, HoverCard, Text} from '@radix-ui/themes';
import {AchievementType, Score} from '../types';
import {DateUtils, UI} from '../utils/common';
import {PersonIcon} from '@radix-ui/react-icons';
import PlaceContainer from './PlaceContainer';

interface ScoreTileProps extends React.HTMLProps<HTMLDivElement> {
  score: Score;
  isLocal?: boolean;
  achievement: AchievementType | undefined;
  position: number;
  showSimple?: boolean;
  hoverContent?: React.ReactNode;
}

function ScoreTile({
  score,
  isLocal,
  achievement,
  position,
  showSimple = false,
  hoverContent,
  className,
}: ScoreTileProps): JSX.Element {
  const {userName, timeElapsed, totalScore, createdAt} = score;
  return (
    <HoverCard.Root>
      <HoverCard.Trigger>
        <div className={UI.cn('flex w-full justify-between', className)}>
          <div className="flex">
            <PlaceContainer
              achievement={achievement}
              showSimple={showSimple}
              position={position}
            />
            {isLocal && (
              <div className="w-6 items-center justify-center flex flex-col ml-2">
                <PersonIcon className="text-white" />
                <Text size={'1'} className="text-white/70 pt-1">
                  You
                </Text>
              </div>
            )}
            <div className="flex ml-2 flex-col justify-between">
              <Heading weight={'medium'} className="text-white" size={'3'}>
                {userName}
              </Heading>
              <Text size={'2'} className="text-white/70">
                {DateUtils.formatDate(createdAt, true)}
              </Text>
            </div>
          </div>
          <div className="flex flex-col text-right">
            <Heading weight={'medium'} className="text-white" size={'3'}>
              {UI.formatPoints(totalScore)}
            </Heading>
            <Text className="text-white/70" size={'2'}>
              {DateUtils.formatTime(timeElapsed, 'sec')}
            </Text>
          </div>
        </div>
      </HoverCard.Trigger>
      <HoverCard.Content
        style={{backgroundColor: 'transparent'}}
        className="-mt-4">
        {hoverContent}
      </HoverCard.Content>
    </HoverCard.Root>
  );
}

export default ScoreTile;
