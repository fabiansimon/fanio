import {useEffect, useState} from 'react';
import {fetchTopScores} from '../utils/api';
import {AchievementType, Score, TimeFrame} from '../types';
import ScoreTile from './ScoreTile';
import {LocalStorage} from '../utils/localStorage';
import EmptyContainer from './EmptyContainer';
import {Heading, Text} from '@radix-ui/themes';

function LeaderboardContainer(): JSX.Element {
  const [scores, setScores] = useState<Score[] | null>();
  const [localScores, setLocalScores] = useState<Set<string> | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchTopScores({
          timeFrame: TimeFrame.DAILY,
          size: 5,
        });
        setLocalScores(LocalStorage.fetchScoreIds());
        setScores(res.content);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col mt-4">
      {(scores?.length || 0) > 0 ? (
        <div className="space-y-2 -mx-2">
          {scores?.map((s, i) => {
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
                isLocal={localScores?.has(s.id)}
                key={i}
                score={s}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center pt-20">
          <Heading className="text-white pb-1" size={'2'}>
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