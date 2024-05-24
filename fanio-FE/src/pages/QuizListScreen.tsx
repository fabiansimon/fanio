import {useCallback, useEffect, useState} from 'react';
import {PaginationState, Quiz} from '../types';
import SearchInput from '../components/SearchInput';
import PaginationBar from '../components/PaginationBar';
import QuizList from '../components/QuizList';
import {PAGE_DATA} from '../constants/Data';
import PageContainer from '../components/PageContainer';
import {useGameDataContext} from '../providers/GameDataProvider';

const INIT_PAGINATION_STATE = {
  pageIndex: 0,
  maxItems: PAGE_DATA.maxItemsOptions[1],
};

function QuizListScreen(): JSX.Element {
  const {
    quizList: {data, refetch, isLoading},
  } = useGameDataContext();
  const [searchResults, setSearchResult] = useState<Quiz[] | null>(null);
  const [pagination, setPagination] = useState(INIT_PAGINATION_STATE);

  useEffect(() => {
    if (pagination === INIT_PAGINATION_STATE) return;
    try {
      const {pageIndex, maxItems} = pagination;
      refetch({page: pageIndex, size: maxItems});
    } catch (error) {
      console.error(error);
    }
  }, [pagination, refetch]);

  const handlePaginationChange = useCallback((data: PaginationState) => {
    setPagination(data);
  }, []);

  return (
    <PageContainer
      title="All Quizzes"
      description="If you can't find something that you like, just go ahead and create it.">
      <SearchInput
        title=""
        subtitle="Filter Results"
        setSearchResult={setSearchResult}
        className="mt-5"
      />
      <QuizList
        className="flex-grow overflow-y-auto mt-4"
        data={searchResults || data?.content || []}
      />
      <PaginationBar
        initialState={INIT_PAGINATION_STATE}
        className="mt-4"
        totalElements={data?.totalElements || 0}
        onValueChange={handlePaginationChange}
      />
    </PageContainer>
  );
}

export default QuizListScreen;
