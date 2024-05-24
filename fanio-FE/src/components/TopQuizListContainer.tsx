import {UI} from '../utils/common';
import QuizList from './QuizList';
import {BreakPoint} from '../types';
import Loading from './Loading';
import useIsMobile from '../hooks/useIsMobile';
import useBreakingPoints from '../hooks/useBreakingPoints';
import {useGameDataContext} from '../providers/GameDataProvider';

interface TopQuizListProps {
  className?: string;
}

function TopQuizListContainer({className}: TopQuizListProps): JSX.Element {
  const {
    topQuizList: {data, isLoading},
  } = useGameDataContext();
  const breakTriggered = useBreakingPoints(BreakPoint.SM);

  const isMobile = useIsMobile();

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
          data={data?.content || []}
          className="py-3 pb-10"
        />
      )}
    </div>
  );
}

export default TopQuizListContainer;
