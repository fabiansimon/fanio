import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from 'react';
import {GameStatistic, PaginatedData, Quiz, Score, TimeFrame} from '../types';
import {
  fetchGameStatistic,
  fetchTopQuizzes,
  fetchTopScores,
} from '../utils/api';
import {PAGE_DATA} from '../constants/Data';

enum MODE {
  topQuizList,
  quizList,
  statistic,
  leaderboard,
  leaderboardToday,
}
interface ContextData<T> {
  data: T | null;
  refetch: (args?: any) => Promise<void>;
  isLoading: boolean;
}

interface GameDataContextType {
  topQuizList: ContextData<PaginatedData<Quiz>>;
  statistic: ContextData<GameStatistic>;
  quizList: ContextData<PaginatedData<Quiz>>;
  leaderboard: ContextData<PaginatedData<Score>>;
  leaderboardToday: ContextData<Score[]>;
}
const GameDataContext = createContext<GameDataContextType | undefined>(
  undefined,
);

function GameDataProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [isLoading, setIsLoading] = useState<MODE | null>(null);
  const [statistic, setStatistic] = useState<GameStatistic | null>(null);
  const [quizList, setQuizList] = useState<PaginatedData<Quiz> | null>(null);
  const [leaderboard, setLeaderboard] = useState<PaginatedData<Score> | null>(
    null,
  );
  const [leaderboardToday, setLeaderboardToday] = useState<Score[] | null>(
    null,
  );
  const [topQuizList, setTopQuizList] = useState<PaginatedData<Quiz> | null>(
    null,
  );

  const load = useCallback(
    async (
      mode: MODE,
      apiCall: () => Promise<any>,
      setData: (data: any) => void,
    ) => {
      setIsLoading(mode);
      try {
        const data = await apiCall();
        setData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(null);
      }
    },
    [],
  );

  const loadTopQuizzes = useCallback(
    () =>
      load(
        MODE.topQuizList,
        () => fetchTopQuizzes({page: 0, size: 5, timeFrame: TimeFrame.ALLTIME}),
        ({content, totalElements}) => setTopQuizList({content, totalElements}),
      ),
    [load],
  );

  const loadStatistic = useCallback(
    () => load(MODE.statistic, fetchGameStatistic, setStatistic),
    [load],
  );

  const loadQuizzes = useCallback(
    ({page, size}: {page: number; size: number}) =>
      load(
        MODE.quizList,
        () => fetchTopQuizzes({page, size}),
        ({content, totalElements}) => setQuizList({content, totalElements}),
      ),
    [load],
  );

  const loadLeaderboard = useCallback(
    ({
      page,
      size,
      timeFrame,
    }: {
      page: number;
      size: number;
      timeFrame: TimeFrame;
    }) =>
      load(
        MODE.leaderboard,
        () => fetchTopScores({page, size, timeFrame}),
        ({content, totalElements}) => setLeaderboard({content, totalElements}),
      ),
    [load],
  );

  const loadLeaderboardToday = useCallback(
    () =>
      load(
        MODE.leaderboardToday,
        () => fetchTopScores({size: 5, timeFrame: TimeFrame.DAILY}),
        ({content}) => setLeaderboardToday(content),
      ),
    [load],
  );

  useEffect(() => {
    loadTopQuizzes();
    loadStatistic();
    loadQuizzes({page: 0, size: PAGE_DATA.initItemsSize});
    loadLeaderboardToday();
    loadLeaderboard({
      page: 0,
      size: PAGE_DATA.initItemsSize,
      timeFrame: TimeFrame.DAILY,
    });
  }, [
    loadTopQuizzes,
    loadStatistic,
    loadQuizzes,
    loadLeaderboard,
    loadLeaderboardToday,
  ]);

  const value = {
    topQuizList: {
      data: topQuizList,
      refetch: loadTopQuizzes,
      isLoading: isLoading === MODE.topQuizList,
    },
    statistic: {
      data: statistic,
      refetch: loadStatistic,
      isLoading: isLoading === MODE.statistic,
    },
    quizList: {
      data: quizList,
      refetch: loadQuizzes,
      isLoading: isLoading === MODE.quizList,
    },
    leaderboard: {
      data: leaderboard,
      refetch: loadLeaderboard,
      isLoading: isLoading === MODE.leaderboard,
    },
    leaderboardToday: {
      data: leaderboardToday,
      refetch: loadLeaderboardToday,
      isLoading: isLoading === MODE.leaderboardToday,
    },
  };

  return (
    <GameDataContext.Provider value={value}>
      {children}
    </GameDataContext.Provider>
  );
}

export function useGameDataContext() {
  const context = useContext(GameDataContext);
  if (!context)
    throw new Error(
      'useGameDataContext must be used within a GameDataProvider',
    );

  return context;
}
export default GameDataProvider;
