import {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {fetchQuizById, fetchScoresFromQuiz} from '../utils/api';
import {AchievementType, PaginationState, Quiz, Score} from '../types';
import ScoreTile from '../components/ScoreTile';
import {LocalStorage} from '../utils/localStorage';
import PageContainer from '../components/PageContainer';
import PaginationBar from '../components/PaginationBar';
import EmptyContainer from '../components/EmptyContainer';
import ROUTES from '../constants/Routes';

function QuizScoreScreen(): JSX.Element {
  const [scoreData, setScoreData] = useState<{
    content: Score[];
    totalElements: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [localScores, setLocalScores] = useState<Set<string> | null>(null);
  const [quizData, setQuizData] = useState<Quiz | null>();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    maxItems: 30,
  });

  const navigation = useNavigate();

  const {id} = useParams();

  const emptyList = useMemo(() => {
    return !isLoading && (!scoreData || scoreData.totalElements === 0);
  }, [scoreData, isLoading]);

  const loadScores = useCallback(async () => {
    try {
      if (!id) return;
      const {pageIndex, maxItems} = pagination;
      const scores = await fetchScoresFromQuiz({
        quizId: id,
        page: pageIndex,
        size: maxItems,
      });
      const quiz = await fetchQuizById({id});
      setLocalScores(LocalStorage.fetchScoreIds());
      setQuizData(quiz);
      setScoreData(scores);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
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
      <div className={'flex flex-col h-full justify-between'}>
        {emptyList ? (
          <EmptyContainer
            className="my-auto"
            title="No Scores to show yet 💨"
            description="Start off the race and be the first one to submit a score"
            buttonText={"Let's play"}
            onClick={() => navigation(`${ROUTES.playQuiz}/${id}`)}
          />
        ) : (
          <>
            <div className="mt-6 space-y-3 overflow-hidden h-full">
              {scoreData?.content?.map((s, i) => {
                const {pageIndex, maxItems} = pagination;
                const position = i + 1 + pageIndex * maxItems;

                let achievement;
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
                    score={s}
                  />
                );
              })}
            </div>
            <PaginationBar
              totalElements={scoreData?.totalElements || 0}
              onValueChange={handlePaginationChange}
            />
          </>
        )}
      </div>
    </PageContainer>
  );
}

export default QuizScoreScreen;
