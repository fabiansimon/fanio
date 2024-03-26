import {useCallback, useEffect, useState} from 'react';
import {PaginatedData, PaginationState, Quiz} from '../types';
import {fetchAllQuizzes} from '../utils/api';
import SearchInput from '../components/SearchInput';
import PaginationBar from '../components/PaginationBar';
import QuizList from '../components/QuizList';
import {PAGE_DATA} from '../constants/Data';
import PageContainer from '../components/PageContainer';

function QuizListScreen(): JSX.Element {
  const [quizData, setQuizData] = useState<PaginatedData<Quiz> | null>();
  const [searchResults, setSearchResult] = useState<Quiz[] | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    maxItems: PAGE_DATA.maxItemsOptions[0],
  });

  const loadQuizzes = useCallback(async () => {
    try {
      const {pageIndex, maxItems} = pagination;
      const {totalElements, content} = await fetchAllQuizzes(
        pageIndex,
        maxItems,
      );
      setQuizData({totalElements, content});
    } catch (error) {
      console.error(error);
    }
  }, [pagination]);

  const handlePaginationChange = useCallback((data: PaginationState) => {
    setPagination(data);
  }, []);

  useEffect(() => {
    (async () => loadQuizzes())();
  }, [loadQuizzes]);

  return (
    <PageContainer
      title="All Quizzes"
      description="If you can't find something that you like, just go ahead and create
    it.">
      <div className="flex flex-col h-full justify-between">
        <div>
          <SearchInput
            title=""
            subtitle="Filter Results"
            setSearchResult={setSearchResult}
            className="mt-5"
          />
          <QuizList data={searchResults || quizData?.content || []} />
        </div>
        <PaginationBar
          totalElements={quizData?.totalElements || 0}
          onValueChange={handlePaginationChange}
        />
      </div>
    </PageContainer>
  );
}

export default QuizListScreen;
