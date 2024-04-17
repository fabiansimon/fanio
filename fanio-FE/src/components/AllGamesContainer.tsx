import {Heading, Text} from '@radix-ui/themes';
import {UI} from '../utils/common';
import Marquee from 'react-fast-marquee';
import {GameStatistic} from '../types';
import {useCallback, useEffect, useState} from 'react';
import {fetchGameStatistic} from '../utils/api';

function AllGamesContainer({className}: {className?: string}): JSX.Element {
  const [statistic, setStatistic] = useState<GameStatistic | null>();

  useEffect(() => {
    (async () => {
      try {
        const {totalGuesses, totalQuizzes, totalSongs, totalTime} =
          await fetchGameStatistic();

        setStatistic({
          totalGuesses,
          totalQuizzes,
          totalSongs,
          totalTime,
        });
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const statisticTerm = useCallback((key: string) => {
    switch (key) {
      case 'totalTime':
        return 'Minutes played';
      case 'totalQuizzes':
        return 'Total Games';
      case 'totalSongs':
        return 'Songs Added';
      case 'totalGuesses':
        return 'Right Guesses';

      default:
        return '';
    }
  }, []);

  return (
    <div className={UI.cn('-mx-5', className)}>
      <Marquee speed={30} className="mb-4 py-auto">
        {statistic &&
          Object.entries(statistic).map(([key, val]) => (
            <div key={key} className="mr-6 w-14 mt-4">
              <Heading size="4" className="text-white">
                {val}
              </Heading>
              <Text size="2" className="text-white/80">
                {statisticTerm(key)}
              </Text>
            </div>
          ))}
      </Marquee>
    </div>
  );
}

export default AllGamesContainer;
