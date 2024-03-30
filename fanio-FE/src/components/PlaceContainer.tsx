import {Text} from '@radix-ui/themes';
import {AchievementType} from '../types';
import {ACHIEVEMENT_COLORS} from '../constants/Theme';
import {useMemo} from 'react';
import {UI} from '../utils/common';

interface PlaceContainerProps {
  achievement?: AchievementType;
  showSimple?: boolean;
  position?: number;
  className?: string;
}

function PlaceContainer({
  achievement,
  showSimple = false,
  position,
  className,
}: PlaceContainerProps): JSX.Element {
  if (achievement != null && !showSimple)
    return <AchievementContainer achievement={achievement} />;

  return (
    <div className={UI.cn('flex p-2 min-w-10', className)}>
      <Text weight={'medium'} className="text-white/80" size={'2'}>
        {position && `${position}#`}
      </Text>
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
    <div style={{backgroundColor}} className="flex min-w-8 p-2 mr-2 rounded-sm">
      {icon}
    </div>
  );
}

export default PlaceContainer;
