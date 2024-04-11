import {motion} from 'framer-motion';
import {Quiz} from '../types';
import QuizList from './QuizList';
import Container from './Container';
import {UI} from '../utils/common';
import {useMemo} from 'react';

const ANIMATION_DURATION = 0.15; // in second

const transition = {
  duration: ANIMATION_DURATION,
  type: 'spring',
  mass: 0.05,
};

const animatedStates = {
  shown: {y: 0},
  hidden: {y: 1000},
};

interface SearchResultContainerProps {
  className?: string;
  onBack?: () => void;
  searchResults: Quiz[] | null;
}

function SearchResultsContainer({
  className,
  onBack,
  searchResults,
}: SearchResultContainerProps): JSX.Element {
  const {title, description} = useMemo(() => {
    let title = '';
    let description = ',';

    const amount = searchResults?.length;
    if (!amount) {
      title = 'Oh no 🙃';
      description = "I'm sorry we weren't able to find anything.";
    } else {
      title = 'Results';
      description = `${amount} matching ${amount === 1 ? 'quiz' : 'quizzes'}`;
    }

    return {
      title,
      description,
    };
  }, [searchResults]);
  return (
    <motion.div
      animate={!searchResults ? 'hidden' : 'shown'}
      variants={animatedStates}
      transition={transition}
      className={UI.cn(
        'flex absolute bottom-0 w-full max-w-screen-xl h-2/4 p-2',
        className,
      )}>
      <Container
        titleColor="text-black"
        descriptionColor="text-neutral-500"
        title={title}
        description={description}
        onBack={onBack}
        className="bg-slate-100 border-neutral-200 w-full"
        content={
          <QuizList className="mt-4" invertColors data={searchResults || []} />
        }
      />
    </motion.div>
  );
}

export default SearchResultsContainer;
