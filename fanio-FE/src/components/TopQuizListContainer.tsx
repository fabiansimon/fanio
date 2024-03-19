import {useCallback, useEffect, useState} from 'react';
import {UI} from '../utils/common';
import PaginationBar from './PaginationBar';
import QuizList from './QuizList';
import {PaginationData, Quiz} from '../types';
import {fetchTopQuizzes} from '../utils/api';
import Loading from './Loading';
import {PAGE_DATA} from '../constants/Data';

interface TopQuizListProps {
  className?: string;
}

function TopQuizListContainer({className}: TopQuizListProps): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quizData, setQuizData] = useState<{
    quizzes: Quiz[];
    totalElements: number;
  } | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    maxItems: PAGE_DATA.maxItemsOptions[0],
  });

  const loadQuizzes = useCallback(async () => {
    try {
      const {pageIndex, maxItems} = pagination;
      const {content, totalElements} = await fetchTopQuizzes(
        pageIndex,
        maxItems,
      );
      setQuizData({
        quizzes: content,
        totalElements: totalElements,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination]);

  const handlePaginationChange = useCallback((data: PaginationData) => {
    setPagination(data);
  }, []);

  useEffect(() => {
    (async () => loadQuizzes())();
  }, [loadQuizzes]);

  return (
    <div className={UI.cn('flex flex-col h-full justify-between', className)}>
      {isLoading ? (
        <Loading className="size-10 self-center my-auto" />
      ) : (
        <>
          <QuizList data={quizData?.quizzes || []} className="mt-4" />
          <PaginationBar
            disableItemsSelector
            totalElements={quizData?.totalElements || 0}
            onValueChange={handlePaginationChange}
            className="ml-auto"
          />
        </>
      )}
    </div>
  );
}

export default TopQuizListContainer;
