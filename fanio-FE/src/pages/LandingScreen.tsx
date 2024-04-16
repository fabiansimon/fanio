import {Heading} from '@radix-ui/themes';
import ROUTES from '../constants/Routes';
import {useNavigate} from 'react-router-dom';
import SearchContainer from '../components/SearchInput';
import {DATA} from '../constants/Data';
import Marquee from 'react-fast-marquee';
import Container from '../components/Container';
import {useMemo, useRef, useState} from 'react';
import {motion} from 'framer-motion';
import {BreakPoint, Quiz} from '../types';
import SearchResultsContainer from '../components/SearchResultsContainer';
import TopQuizListContainer from '../components/TopQuizListContainer';
import AllGamesContainer from '../components/AllGamesContainer';
import LeaderboardContainer from '../components/LeaderboardContainer';
import useBreakingPoints from '../hooks/useBreakingPoints';
import ToastController from '../controllers/ToastController';

interface MenuOptions {
  title: string;
  description?: string;
  onPress?: () => void;
  hotkey?: string;
  className?: string;
  content?: React.ReactNode;
  isHidden?: boolean;
}

const ANIMATION_DURATION = 0.15; // in second

function LandingScreen(): JSX.Element {
  const breakActive = useBreakingPoints(BreakPoint.SM);
  const searchRef = useRef<any>();
  const [searchResults, setSearchResult] = useState<Quiz[] | null>(null);

  const navigation = useNavigate();

  const transition = {
    duration: ANIMATION_DURATION,
    type: 'spring',
    mass: 0.05,
  };

  const animatedStates = {
    shown: {y: 0},
    hidden: {y: 1000},
  };

  const MENU_OPTIONS: MenuOptions[] = useMemo(
    () => [
      {
        title: 'Todays top quizzes',
        description:
          "If you can't see anything you like, you can always search for it or just create it.",
        className:
          'bg-gradient-to-b from-blue-600 to-blue-500 border-blue-700 flex-1',
        content: <TopQuizListContainer />,
      },
      {
        title: 'Create Quiz',
        description: 'Join the community and challenge your peers!',
        onPress: () => navigation(ROUTES.createQuiz),
        hotkey: 'C',
        className:
          'bg-gradient-to-b from-violet-700 to-violet-500 border-violet-900',
      },
      {
        title: 'All Quizzes',
        description: 'Check out what we have to offer so far.',
        onPress: () => navigation(ROUTES.listQuizzes),
        hotkey: 'A',
        className:
          'bg-gradient-to-b from-green-600 to-green-500 border-green-900',
        content: <AllGamesContainer />,
      },

      {
        title: 'Leaderboard',
        description: 'Todays top players',
        onPress: () => navigation(ROUTES.leaderboard),
        hotkey: 'L',
        className:
          'bg-gradient-to-b from-red-600 to-red-500 border-red-900 col-span-2 row-span-6',
        content: <LeaderboardContainer />,
        isHidden: breakActive,
      },
    ],
    [navigation, breakActive],
  );

  return (
    <div className="flex flex-col bg-neutral-950 items-center w-full h-screen fixed">
      <>
        <div className="w-full mt-12 pl-4 space-y-2">
          <Heading size={'8'} className="text-white text-center">
            Fan.io 🎤
          </Heading>
          <MarqueeContainer className="-ml-4" />
        </div>

        <SearchContainer
          ref={searchRef}
          setSearchResult={setSearchResult}
          className="flex flex-1 justify-center"
        />
      </>
      <motion.div
        animate={searchResults ? 'hidden' : 'shown'}
        variants={animatedStates}
        transition={transition}
        className="flex bottom-0 justify-center w-full max-w-screen-lg space-x-2 p-2 max-h-[50%] flex-1">
        <Container
          hotkey={MENU_OPTIONS[0].hotkey}
          title={MENU_OPTIONS[0].title}
          description={MENU_OPTIONS[0].description}
          onClick={MENU_OPTIONS[0].onPress}
          className={MENU_OPTIONS[0].className}
          content={MENU_OPTIONS[0].content}
        />

        <div className="grid grid-cols-1 flex-1 sm:grid-cols-2 gap-2">
          {MENU_OPTIONS.slice(1)
            .filter(c => !c.isHidden)
            .map((option, index) => {
              const {hotkey, title, description, onPress, className, content} =
                option;

              return (
                <Container
                  hotkey={hotkey}
                  key={index}
                  title={title}
                  description={description}
                  onClick={onPress}
                  className={className}
                  content={content}
                />
              );
            })}
        </div>
      </motion.div>
      <SearchResultsContainer
        onBack={() => searchRef.current?.clearSearch()}
        searchResults={searchResults}
      />
    </div>
  );
}

function MarqueeContainer({className}: {className?: string}): JSX.Element {
  const {artistList} = DATA;

  return (
    <div className={className}>
      <Marquee>
        {artistList
          .filter((_, i) => i % 2)
          .map((a, i) => (
            <div>
              <Heading
                key={i}
                size={'4'}
                weight={'light'}
                className="text-neutral-500 pr-2">
                {`${a} • `}
              </Heading>
            </div>
          ))}
      </Marquee>
      <Marquee>
        {artistList
          .filter((_, i) => !(i % 2))
          .map((a, i) => (
            <Heading
              key={i}
              size={'4'}
              weight={'light'}
              className="text-neutral-500 pr-2">
              {`${a} • `}
            </Heading>
          ))}
      </Marquee>
    </div>
  );
}

export default LandingScreen;
