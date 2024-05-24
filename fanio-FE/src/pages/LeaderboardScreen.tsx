import {useCallback, useEffect, useMemo, useState} from 'react';
import {AchievementType, PaginationState, TimeFrame} from '../types';
import ScoreTile from '../components/ScoreTile';
import PageContainer from '../components/PageContainer';
import PaginationBar from '../components/PaginationBar';
import {Select} from '@radix-ui/themes';
import {useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';
import EmptyContainer from '../components/EmptyContainer';
import QuizLink from '../components/QuizLink';
import {useGameDataContext} from '../providers/GameDataProvider';

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
  const {
    leaderboard: {data, refetch, isLoading},
  } = useGameDataContext();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(TimeFrame.DAILY);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    maxItems: 10,
  });

  const navigate = useNavigate();

  const emptyList = useMemo(() => {
    return !data || data.totalElements === 0;
  }, [data]);

  useEffect(() => {
    try {
      const {pageIndex, maxItems} = pagination;
      refetch({
        timeFrame,
        page: pageIndex,
        size: maxItems,
      });
    } catch (error) {
      console.error(error);
    }
  }, [pagination, timeFrame, refetch]);

  const handlePaginationChange = useCallback((data: PaginationState) => {
    setPagination(data);
  }, []);

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
        <TimeSelector value={timeFrame} onValueChange={setTimeFrame} />
      }>
      <div className="flex flex-col h-full overflow-y-auto justify-between">
        {!emptyList ? (
          <div className="mt-6 space-y-3 overflow-y-auto my-4">
            {data?.content?.map((s, i) => {
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
                  position={position}
                  hoverContent={<QuizLink quizId={s.quizId} user={s.user} />}
                  achievement={achievement}
                  key={i}
                  score={s}
                />
              );
            })}
          </div>
        ) : (
          <div className="h-full items-center justify-center flex flex-col">
            <EmptyContainer
              className="py-auto"
              title="No scores to be show yet 💨"
              description={
                timeFrame === TimeFrame.ALLTIME
                  ? 'Start off the race and be the first one to submit a score'
                  : 'No new daily scores but check out the All Time Greats'
              }
              buttonText={
                timeFrame === TimeFrame.ALLTIME
                  ? 'Play a Quiz'
                  : 'Show All Time Scores'
              }
              onClick={() => {
                timeFrame === TimeFrame.ALLTIME
                  ? navigate(ROUTES.listQuizzes)
                  : setTimeFrame(TimeFrame.ALLTIME);
              }}
            />
          </div>
        )}
        <PaginationBar
          initialState={pagination}
          totalElements={data?.totalElements || 0}
          onValueChange={handlePaginationChange}
        />
      </div>
    </PageContainer>
  );
}

function TimeSelector({
  value,
  onValueChange,
}: {
  value: TimeFrame;
  onValueChange: (timeFrame: TimeFrame) => void;
}): JSX.Element {
  return (
    <Select.Root
      value={value}
      onValueChange={(value: TimeFrame) => onValueChange(value)}
      defaultValue={value}>
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
