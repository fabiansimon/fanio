import {useCallback, useEffect, useMemo, useState} from 'react';
import {fetchQuizById, fetchTopScores} from '../utils/api';
import {PlayIcon} from '@radix-ui/react-icons';
import {
  AchievementType,
  PaginationState,
  Quiz,
  Score,
  TimeFrame,
} from '../types';
import ScoreTile from '../components/ScoreTile';
import {LocalStorage} from '../utils/localStorage';
import PageContainer from '../components/PageContainer';
import PaginationBar from '../components/PaginationBar';
import {Heading, Select, Text} from '@radix-ui/themes';
import Loading from '../components/Loading';
import {useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';

const timeFrameData = {
  [TimeFrame.DAILY]: {
    text: 'Todays',
    selector: 'Today',
  },
  [TimeFrame.WEEKLY]: {
    text: 'This Weeks',
    selector: 'Weekly',
  },
  [TimeFrame.MONTHLY]: {
    text: 'This Months',
    selector: 'Monthly',
  },
  [TimeFrame.ALLTIME]: {
    text: 'All Time',
    selector: 'All Time',
  },
};

function LeaderboardScreen(): JSX.Element {
  const [scoreData, setScoreData] = useState<{
    content: Score[];
    totalElements: number;
  } | null>(null);
  const [localScores, setLocalScores] = useState<Set<string> | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(TimeFrame.DAILY);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    maxItems: 10,
  });

  const loadScores = useCallback(async () => {
    try {
      const {pageIndex, maxItems} = pagination;
      const scores = await fetchTopScores({
        timeFrame,
        page: pageIndex,
        size: maxItems,
      });
      setLocalScores(LocalStorage.fetchScoreIds());
      setScoreData(scores);
    } catch (error) {
      console.error(error);
    }
  }, [pagination, timeFrame]);

  const handlePaginationChange = useCallback((data: PaginationState) => {
    setPagination(data);
  }, []);

  useEffect(() => {
    (async () => loadScores())();
  }, [loadScores]);

  const {title, description} = useMemo(() => {
    return {
      title: `${timeFrameData[timeFrame].text} Top Scores`,
      description: "Don't see yourself on here? Well it's time to change that",
    };
  }, [timeFrame]);

  return (
    <PageContainer
      title={title}
      description={description}
      trailing={
        <TimeSelector defaultValue={timeFrame} onValueChange={setTimeFrame} />
      }>
      <div className="flex flex-col h-full justify-between">
        <div className="mt-6 space-y-3">
          {scoreData?.content?.map((s, i) => {
            const {pageIndex, maxItems} = pagination;
            const position = i + 1 + pageIndex * maxItems;

            let achievement;
            if (i < 3 && pagination.pageIndex === 0) {
              achievement = [
                AchievementType.FIRST,
                AchievementType.SECOND,
                AchievementType.THIRD,
              ][i];
            }

            return (
              <ScoreTile
                className="cursor-pointer"
                hoverContent={<QuizLink quizId={s.quizId} />}
                position={position}
                achievement={achievement}
                isLocal={localScores?.has(s.id)}
                key={i}
                score={s}
              />
            );
          })}
        </div>
        <PaginationBar
          initialState={pagination}
          totalElements={scoreData?.totalElements || 0}
          onValueChange={handlePaginationChange}
        />
      </div>
    </PageContainer>
  );
}

function QuizLink({quizId}: {quizId: string}): JSX.Element {
  const [quizData, setQuizData] = useState<Quiz | null>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigate();

  useEffect(() => {
    (async () => {
      const storedQuiz = LocalStorage.fetchStoredQuizById(quizId);
      if (storedQuiz) {
        setQuizData(storedQuiz);
        return;
      }

      setIsLoading(true);
      try {
        const quiz = await fetchQuizById({id: quizId});
        setQuizData(quiz);
        LocalStorage.saveQuizData(quiz);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [quizId]);

  return (
    <div className="border bg-neutral-900 border-neutral-500/20 shadow-black rounded-lg py-2 px-3 -m-4">
      {isLoading ? (
        <Loading className="size-6 text-white" />
      ) : (
        <div className="flex space-x-4 items-center">
          <div>
            <Heading size={'2'} className="text-white">
              {quizData?.title}
            </Heading>
            {quizData?.description && (
              <Text size={'1'} className="text-white/60">
                {quizData.description}
              </Text>
            )}
          </div>
          <div
            onClick={() =>
              !quizData?.isPrivate && navigation(`${ROUTES.playQuiz}/${quizId}`)
            }
            className="flex cursor-pointer size-10 bg-neutral-300/10 items-center justify-center rounded-full">
            {quizData?.isPrivate ? (
              <Text className="text-white/80 text-[9px]">Private</Text>
            ) : (
              <PlayIcon className="text-white/50" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TimeSelector({
  defaultValue,
  onValueChange,
}: {
  defaultValue: TimeFrame;
  onValueChange: (timeFrame: TimeFrame) => void;
}): JSX.Element {
  return (
    <Select.Root
      onValueChange={(value: TimeFrame) => onValueChange(value)}
      defaultValue={defaultValue}>
      <Select.Trigger />
      <Select.Content position="popper">
        <Select.Group>
          {Object.entries(timeFrameData).map(([key, val]) => (
            <Select.Item key={key} value={key}>
              {val.selector}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
}

export default LeaderboardScreen;
