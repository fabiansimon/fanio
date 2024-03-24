import {useEffect, useState} from 'react';
import {fetchScoresFromQuiz} from '../utils/api';
import {AchievementType, Score} from '../types';
import ScoreTile from './ScoreTile';
import {LocalStorage} from '../utils/localStorage';

function TopScoresContainer(): JSX.Element {
  const [scores, setScores] = useState<Score[] | null>();
  const [localScores, setLocalScores] = useState<Set<string> | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchScoresFromQuiz({
          quizId: 'ea308a1f-c5d2-426d-b5a9-a67098639731',
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
      <div className="space-y-2">
        {scores?.map((s, i) => {
          let achievement = null;
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
    </div>
  );
}

export default TopScoresContainer;
