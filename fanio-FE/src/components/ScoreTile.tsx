import {Heading, Text} from '@radix-ui/themes';
import {AchievementType, Score} from '../types';
import {DateUtils, UI} from '../utils/common';
import {PersonIcon} from '@radix-ui/react-icons';
import {useCallback, useMemo} from 'react';
import {ACHIEVEMENT_COLORS} from '../constants/Theme';

function ScoreTile({
  score,
  isLocal,
  achievement,
  position,
  showSimple = false,
}: {
  score: Score;
  isLocal?: boolean;
  achievement: AchievementType | null;
  position: number;
  showSimple?: boolean;
}): JSX.Element {
  const {userName, timeElapsed, totalScore, createdAt} = score;

  const positionContainer = useMemo(() => {
    if (achievement != null && !showSimple)
      return <AchievementContainer achievement={achievement} />;

    return (
      <div className="flex p-2" style={{width: showSimple ? 30 : 40}}>
        <Text weight={'bold'} className="text-white" size={'2'}>
          {position}#
        </Text>
      </div>
    );
  }, [score, showSimple, position]);

  return (
    <div className="flex w-full justify-between">
      <div className="flex">
        {positionContainer}
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
  );
}

function AchievementContainer({
  achievement,
}: {
  achievement: AchievementType;
}): JSX.Element {
  const {icon, backgroundColor} = useMemo(() => {
    return {
      icon: (
        <div className="flex flex-col">
          <Text weight={'bold'} className="text-slate-800" size={'2'}>
            {[1, 2, 3][achievement]}#
          </Text>
        </div>
      ),
      backgroundColor: [
        ACHIEVEMENT_COLORS.gold,
        ACHIEVEMENT_COLORS.silver,
        ACHIEVEMENT_COLORS.bronze,
      ][achievement],
    };
  }, [achievement]);

  return (
    <div style={{backgroundColor}} className="flex w-10 p-2 rounded-sm">
      {icon}
    </div>
  );
}
export default ScoreTile;
