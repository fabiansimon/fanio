import {useCallback, useEffect, useState} from 'react';
import {UI} from '../utils/common';
import PaginationBar from './PaginationBar';
import QuizList from './QuizList';
import {
  BreakPoint,
  ButtonType,
  PaginatedData,
  PaginationState,
  Quiz,
} from '../types';
import {fetchTopQuizzes} from '../utils/api';
import Loading from './Loading';
import Button from './Button';
import {useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';
import useIsMobile from '../hooks/useIsMobile';
import {ScrollArea} from '@radix-ui/themes';
import useBreakingPoints from '../hooks/useBreakingPoints';

interface TopQuizListProps {
  className?: string;
}

function TopQuizListContainer({className}: TopQuizListProps): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quizData, setQuizData] = useState<PaginatedData<Quiz> | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    maxItems: 10,
  });

  const breakTriggered = useBreakingPoints(BreakPoint.SM);

  const navigation = useNavigate();
  const isMobile = useIsMobile();

  const loadQuizzes = useCallback(async () => {
    try {
      const {pageIndex, maxItems} = pagination;
      const {content, totalElements} = await fetchTopQuizzes(
        pageIndex,
        maxItems,
      );
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
    <div className={UI.cn('flex flex-col', className)}>
      {isLoading ? (
        <Loading className="size-10 self-center my-auto text-white" />
      ) : (
        <>
          <div className="">
            <QuizList
              showPlacement={!isMobile}
              showScore={!breakTriggered}
              data={quizData?.content || []}
              className="mt-4 -mx-2"
            />
          </div>
          {/* <PaginationBar
            disableItemsSelector
            initialState={{maxItems: 5, pageIndex: 0}}
            totalElements={quizData?.totalElements || 0}
            onValueChange={handlePaginationChange}
            className="ml-auto"
          /> */}
        </>
      )}
      <Button
        type={ButtonType.outline}
        textSize="2"
        className="border-white/30"
        hotkey="A"
        text="See All"
        onClick={() => navigation(ROUTES.listQuizzes)}
      />
    </div>
  );
}

export default TopQuizListContainer;
