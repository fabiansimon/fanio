import {useCallback, useEffect, useState} from 'react';
import {UI} from '../utils/common';
import QuizList from './QuizList';
import {
  BreakPoint,
  PaginatedData,
  PaginationState,
  Quiz,
  TimeFrame,
} from '../types';
import {fetchTopQuizzes} from '../utils/api';
import Loading from './Loading';
import useIsMobile from '../hooks/useIsMobile';
import useBreakingPoints from '../hooks/useBreakingPoints';

interface TopQuizListProps {
  className?: string;
}

function TopQuizListContainer({className}: TopQuizListProps): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quizData, setQuizData] = useState<PaginatedData<Quiz> | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    maxItems: 5,
  });

  const breakTriggered = useBreakingPoints(BreakPoint.SM);

  const isMobile = useIsMobile();

  const loadQuizzes = useCallback(async () => {
    try {
      const {pageIndex, maxItems} = pagination;
      const {content, totalElements} = await fetchTopQuizzes({
        page: pageIndex,
        size: maxItems,
        timeFrame: TimeFrame.ALLTIME,
      });
      setQuizData({
        content,
        totalElements,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination]);

  const handlePaginationChange = useCallback((data: PaginationState) => {
    setPagination(data);
  }, []);

  useEffect(() => {
    (async () => loadQuizzes())();
  }, [loadQuizzes]);

  return (
    <div
      className={UI.cn(
        'flex flex-col h-full w-full overflow-y-auto -mx-2 my-2',
        className,
      )}>
      {isLoading ? (
        <Loading className="size-10 self-center my-auto text-white" />
      ) : (
        <QuizList
          showPlacement={!isMobile}
          showScore={!breakTriggered}
          data={quizData?.content || []}
          className="py-3 pb-10"
        />
      )}
    </div>
  );
}

export default TopQuizListContainer;
