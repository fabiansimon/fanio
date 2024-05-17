import {Heading, Text} from '@radix-ui/themes';
import {AchievementType, LocalScore, Score} from '../types';
import {DateUtils, UI} from '../utils/common';
import {PersonIcon} from '@radix-ui/react-icons';
import PlaceContainer from './PlaceContainer';
import {isLocalScore} from '../types/typeGuards';
import {useUserDataContext} from '../providers/UserDataProvider';
import {useMemo} from 'react';
import Hoverable from './Hoverable';

interface ScoreTileProps extends React.HTMLProps<HTMLDivElement> {
  score: Score | LocalScore;
  achievement?: AchievementType | undefined;
  position?: number;
  showSimple?: boolean;
  hoverContent?: React.ReactNode;
}

function ScoreTile({
  score,
  achievement,
  position,
  showSimple = false,
  hoverContent,
  className,
}: ScoreTileProps): JSX.Element {
  const {userData} = useUserDataContext();
  const {timeElapsed, totalScore, createdAt} = score;

  const isSelf = useMemo(() => {
    if (isLocalScore(score)) return true;
    if (!userData) return false;
    return userData?.id === score?.user?.id;
  }, [userData, score]);

  return (
    <Hoverable hoverContent={hoverContent}>
      <div className={UI.cn('flex w-full justify-between', className)}>
        <div className="flex">
          <PlaceContainer
            achievement={achievement}
            showSimple={showSimple}
            position={position}
          />
          {isSelf && (
            <div className="w-6 items-center justify-center flex flex-col ml-2">
              <PersonIcon className="text-white" />
              <Text size={'1'} className="text-white/70 pt-1">
                You
              </Text>
            </div>
          )}
          <div className="flex ml-2 flex-col justify-between">
            <Heading weight={'regular'} className="text-white" size={'2'}>
              {isLocalScore(score) ? 'Last Attempt' : score.userName}
            </Heading>
            <Text size={'2'} className="text-white/60">
              {DateUtils.formatDate(createdAt, true)}
            </Text>
          </div>
        </div>
        <div className="flex flex-col text-right">
          <Heading weight={'regular'} className="text-white" size={'2'}>
            {UI.formatPoints(totalScore)}
          </Heading>
          <Text className="text-white/60" size={'2'}>
            {DateUtils.formatTime(timeElapsed, 'sec')}
          </Text>
        </div>
      </div>
    </Hoverable>
  );
}

export default ScoreTile;
