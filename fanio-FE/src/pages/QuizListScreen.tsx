import {useCallback, useEffect, useState} from 'react';
import {PaginatedQuizData, PaginationState, Quiz} from '../types';
import {fetchAllQuizzes} from '../utils/api';
import {useNavigate} from 'react-router-dom';
import {Heading, Link} from '@radix-ui/themes';
import SearchInput from '../components/SearchInput';
import PaginationBar from '../components/PaginationBar';
import {ArrowLeftIcon} from '@radix-ui/react-icons';
import QuizList from '../components/QuizList';
import {PAGE_DATA} from '../constants/Data';

function QuizListScreen(): JSX.Element {
  const [quizData, setQuizData] = useState<PaginatedQuizData | null>();
  const [searchResults, setSearchResult] = useState<Quiz[] | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    maxItems: PAGE_DATA.maxItemsOptions[0],
  });

  const navigation = useNavigate();

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
    <div className=" bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col max-w-screen-xl justify-between  w-full h-screen pb-12 px-10">
        <div>
          <div className="mt-12 w-full">
            <ArrowLeftIcon
              onClick={() => navigation(-1)}
              className="size-6 cursor-pointer text-white mb-1"
            />
            <Heading size={'7'} className="text-white text-left ">
              All Quizzes
            </Heading>
            <Heading
              size={'4'}
              weight={'light'}
              className="text-neutral-500 pr-2">
              If you can't find something that you like, just go ahead and
              create it.
            </Heading>
          </div>
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
    </div>
  );
}

export default QuizListScreen;
