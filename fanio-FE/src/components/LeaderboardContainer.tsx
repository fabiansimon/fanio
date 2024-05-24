import {AchievementType} from '../types';
import ScoreTile from './ScoreTile';
import {Heading, Text} from '@radix-ui/themes';
import {useGameDataContext} from '../providers/GameDataProvider';

function LeaderboardContainer(): JSX.Element {
  const {
    leaderboardToday: {data, isLoading},
  } = useGameDataContext();

  return (
    <div className="flex flex-col flex-grow h-full mt-4">
      {(data?.length || 0) > 0 ? (
        <div className="space-y-2 -mx-2">
          {data?.map((s, i) => {
            let achievement;
            if (i < 3) {
              achievement = [
                AchievementType.FIRST,
                AchievementType.SECOND,
                AchievementType.THIRD,
              ][i];
            }

            return (
              <ScoreTile
                showSimple
                position={i + 1}
                achievement={achievement}
                key={i}
                score={s}
              />
            );
          })}
        </div>
      ) : (
        <div className="absolute top-0 left-0 right-0 flex flex-col flex-grow h-full items-center justify-center">
          <Heading className="text-white pb-1 pt-6" size={'2'}>
            Oh no 🥱
          </Heading>
          <Text className="text-white/80" size={'2'}>
            Nothing to show yet...
          </Text>
        </div>
      )}
    </div>
  );
}

export default LeaderboardContainer;
