import {Heading, Text} from '@radix-ui/themes';
import {UI} from '../utils/common';
import Marquee from 'react-fast-marquee';
import {useCallback} from 'react';
import {useGameDataContext} from '../providers/GameDataProvider';

function AllGamesContainer({className}: {className?: string}): JSX.Element {
  const {
    statistic: {isLoading, data},
  } = useGameDataContext();

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
        {!isLoading &&
          data &&
          Object.entries(data).map(([key, val]) => (
            <div key={key} className="mr-6 mt-4">
              <Heading size="4" className="text-white">
                {UI.formatNumber(val)}
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
