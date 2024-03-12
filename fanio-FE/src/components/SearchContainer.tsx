import {Quiz} from '../types';
import InputField from './InputField';
import {useState, useEffect, useCallback} from 'react';
import QuizPreview from './QuizPreview';
import {searchQuizByTerm} from '../utils/api';
import {debounce} from 'lodash';

const DEBOUNCE_TIMEOUT = 500;

function SearchContainer(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Quiz[] | []>();
  const [input, setInput] = useState<string | null>();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    setInput(value);
  };

  const searchForQuiz = async (val: string) => {
    try {
      const res = await searchQuizByTerm(val);
      if (res?.length > 0) setResults(res);
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
      return setResults([]);
    }
    setIsLoading(true);
    debouncedSearch(input);
  }, [input]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col">
      <InputField onChange={handleInput} value={input || ''} />
      {isLoading ? (
        <div>loading...</div>
      ) : (
        <div className="mt-2 space-y-2">
          {results?.map((r, i) => (
            <QuizPreview defaultNavigation key={i} quiz={r} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchContainer;
