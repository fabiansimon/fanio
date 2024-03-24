import {useCallback, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {fetchQuizById, fetchScoresFromQuiz} from '../utils/api';
import {AchievementType, PaginationState, Quiz, Score} from '../types';
import ScoreTile from '../components/ScoreTile';
import {LocalStorage} from '../utils/localStorage';
import PageContainer from '../components/PageContainer';
import PaginationBar from '../components/PaginationBar';
import {PAGE_DATA} from '../constants/Data';

function QuizScoreScreen(): JSX.Element {
  const [scoreData, setScoreData] = useState<{
    content: Score[];
    totalElements: number;
  } | null>(null);
  const [localScores, setLocalScores] = useState<Set<string> | null>(null);
  const [quizData, setQuizData] = useState<Quiz | null>();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    maxItems: 30,
  });

  const {id} = useParams();

  const loadScores = useCallback(async () => {
    try {
      if (!id) return;
      const {pageIndex, maxItems} = pagination;
      const scores = await fetchScoresFromQuiz({
        quizId: id,
        page: pageIndex,
        size: maxItems,
      });
      const quiz = await fetchQuizById(id);
      setLocalScores(LocalStorage.fetchScoreIds());
      setQuizData(quiz);
      setScoreData(scores);
    } catch (error) {
      console.error(error);
    }
  }, [pagination, id]);

  const handlePaginationChange = useCallback((data: PaginationState) => {
    setPagination(data);
  }, []);

  useEffect(() => {
    (async () => loadScores())();
  }, [loadScores]);

  return (
    <PageContainer title={quizData?.title} description="Top scores">
      <div className="flex flex-col h-full justify-between">
        <div className="mt-6 space-y-3">
          {scoreData?.content?.map((s, i) => {
            const {pageIndex, maxItems} = pagination;
            const position = i + 1 + pageIndex * maxItems;

            let achievement = null;
            if (i < 3 && pagination.pageIndex === 0) {
              achievement = [
                AchievementType.FIRST,
                AchievementType.SECOND,
                AchievementType.THIRD,
              ][i];
            }

            return (
              <ScoreTile
                position={position}
                achievement={achievement}
                isLocal={localScores?.has(s.id)}
                key={i}
                score={s}
              />
            );
          })}
        </div>
        <PaginationBar
          totalElements={scoreData?.totalElements || 0}
          onValueChange={handlePaginationChange}
        />
      </div>
    </PageContainer>
  );
}

export default QuizScoreScreen;
