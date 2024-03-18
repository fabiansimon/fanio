import {Quiz} from '../types';
import InputField from './InputField';
import {useState, useEffect, useCallback} from 'react';
import QuizPreview from './QuizPreview';
import {searchQuizByTerm} from '../utils/api';
import {debounce} from 'lodash';
import {UI} from '../utils/common';
import {Heading, Text} from '@radix-ui/themes';
import Loading from './Loading';

const DEBOUNCE_TIMEOUT = 500;

interface SearchContainerProps {
  className?: string;
  setSearchResult: (resultData: Quiz[] | null) => void;
}

function SearchContainer({
  className,
  setSearchResult,
}: SearchContainerProps): JSX.Element {
  const [input, setInput] = useState<string | null>();
  const [isLoading, setIsLoading] = useState<boolean>();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    setInput(value);
  };

  const searchForQuiz = async (val: string) => {
    setIsLoading(true);
    try {
      const res = await searchQuizByTerm(val);
      setSearchResult(res);
    } catch (error) {
      console.warn('No quiz found with title:', val);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((val: string) => searchForQuiz(val), DEBOUNCE_TIMEOUT),
    [],
  );

  useEffect(() => {
    if (!input) {
      return setSearchResult(null);
    }
    setIsLoading(true);
    debouncedSearch(input);
  }, [input, debouncedSearch, setSearchResult]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className={UI.cn('flex flex-col', className)}>
      <Heading size={'3'} weight="medium" className="text-white">
        Looking for anything specific?
      </Heading>
      <Text size={'2'} className="text-neutral-500">
        search for artists, titles or even possible song titles
      </Text>
      <div className="h-2" />
      <div className="flex relative">
        <InputField onChange={handleInput} value={input || ''} />
        {isLoading && <Loading className="absolute right-1 bottom-1 size-7" />}
      </div>
    </div>
  );
}

export default SearchContainer;
