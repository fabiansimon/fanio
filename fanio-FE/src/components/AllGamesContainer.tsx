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
    <div className={UI.cn('-mx-5 mt-auto', className)}>
      <Marquee speed={30} className="mb-4">
        {statistic &&
          Object.entries(statistic).map(([key, val]) => (
            <div key={key} className="mr-6 w-12">
              <Heading size={'4'} className="text-white" key={key}>
                {val}
              </Heading>
              <Text
                size={'2'}
                className="text-white/80 flex pt-[1.5pt]"
                key={key}>
                {statisticTerm(key)}
              </Text>
            </div>
          ))}
      </Marquee>
    </div>
  );
}

export default AllGamesContainer;
