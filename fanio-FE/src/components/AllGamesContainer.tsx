import {Heading, Text} from '@radix-ui/themes';
import {UI} from '../utils/common';
import Marquee from 'react-fast-marquee';
import {GameStatistic} from '../types';

const MOCK_STATISTIC: GameStatistic = {
  totalGames: {
    title: 'Games created',
    amount: 23,
  },
  totalSongs: {
    title: 'Songs played',
    amount: 48,
  },
  totalGuesses: {
    title: 'Total Guesses',
    amount: 112,
  },
  totalTimeSpent: {
    title: 'Minutes played',
    amount: 2132,
  },
};

function AllGamesContainer({className}: {className?: string}): JSX.Element {
  return (
    <div className={UI.cn('-mx-5 mt-auto', className)}>
      <Marquee speed={30} className="mb-4">
        {Object.entries(MOCK_STATISTIC).map(([key, val]) => (
          <div key={key} className="mr-6 w-14">
            <Heading
              size={'4'}
              className="text-white"
              key={key}>{`${val.amount}`}</Heading>
            <Text
              size={'2'}
              className="text-white/80 flex pt-[1.5pt]"
              key={key}>{`${val.title} `}</Text>
          </div>
        ))}
      </Marquee>
    </div>
  );
}

export default AllGamesContainer;
