import {Heading} from '@radix-ui/themes';
import ROUTES from '../constants/Routes';
import {useNavigate} from 'react-router-dom';
import SearchContainer from '../components/SearchInput';
import {DATA} from '../constants/Data';
import Marquee from 'react-fast-marquee';
import Container from '../components/Container';
import {useEffect, useMemo, useRef, useState} from 'react';
import {motion} from 'framer-motion';
import {Quiz} from '../types';
import {fetchTopQuizzes} from '../utils/api';
import SearchResultsContainer from '../components/SearchResultsContainer';
import TopQuizListContainer from '../components/TopQuizListContainer';

interface MenuOptions {
  title: string;
  description?: string;
  onPress?: () => void;
  hotkey?: string;
  className?: string;
  content?: React.ReactNode;
}

const ANIMATION_DURATION = 0.15; // in second

function LandingScreen(): JSX.Element {
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
          "If you can't see anything you like, you can always search for it or even create it",
        className: 'bg-blue-500 w-full h-full border-blue-700',
        content: <TopQuizListContainer />,
      },
      {
        title: 'All Games',
        onPress: () => navigation(ROUTES.listQuizzes),
        hotkey: 'A',
        className: 'bg-green-600 border-green-900',
      },
      {
        title: 'Create Game',
        onPress: () => navigation(ROUTES.createQuiz),
        hotkey: 'C',
        className: 'bg-violet-700 border-violet-900 ',
      },
      {
        title: 'Leaderboard',
        onPress: () => navigation(ROUTES.createQuiz),
        hotkey: 'L',
        className: 'bg-red-600 border-red-900 col-span-2',
      },
    ],
    [navigation],
  );

  return (
    <div className="flex flex-col space-y-2 items-center bg-slate-950 w-full h-screen">
      <div className="mt-12  flex w-full px-12">
        <Heading size={'9'} className="text-white text-left ">
          Fanio 🎤
        </Heading>
      </div>
      <MarqueeContainer className="pt-4" />
      <SearchContainer
        ref={searchRef}
        setSearchResult={setSearchResult}
        className="flex h-[50%] justify-center px-[30%]"
      />
      <SearchResultsContainer
        onBack={() => searchRef.current?.clearSearch()}
        searchResults={searchResults}
      />

      <motion.div
        animate={searchResults ? 'hidden' : 'shown'}
        variants={animatedStates}
        transition={transition}
        className="flex justify-center w-full max-w-screen-xl h-full space-x-2 p-2">
        <Container
          hotkey={MENU_OPTIONS[0].hotkey}
          title={MENU_OPTIONS[0].title}
          description={MENU_OPTIONS[0].description}
          onClick={MENU_OPTIONS[0].onPress}
          className={MENU_OPTIONS[0].className}
          content={MENU_OPTIONS[0].content}
        />
        <div className="grid grid-cols-2 gap-2 w-full">
          {MENU_OPTIONS.slice(1).map((option, index) => {
            const {hotkey, title, description, onPress, className} = option;
            return (
              <Container
                hotkey={hotkey}
                key={index}
                title={title}
                description={description}
                onClick={onPress}
                className={className}
              />
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function MarqueeContainer({className}: {className: string}): JSX.Element {
  const {artistList} = DATA;

  return (
    <div className={className}>
      <Marquee>
        {artistList
          .filter((_, i) => i % 2)
          .map((a, i) => (
            <Heading
              key={i}
              size={'4'}
              weight={'light'}
              style={{maxLines: 1}}
              className="text-neutral-500 pr-2">
              {`${a} • `}
            </Heading>
          ))}
      </Marquee>
      <Marquee speed={40}>
        {artistList
          .filter((_, i) => !(i % 2))
          .map((a, i) => (
            <Heading
              key={i}
              size={'4'}
              weight={'light'}
              style={{maxLines: 1}}
              className="text-neutral-500 pr-2">
              {`${a} • `}
            </Heading>
          ))}
      </Marquee>
    </div>
  );
}

export default LandingScreen;
