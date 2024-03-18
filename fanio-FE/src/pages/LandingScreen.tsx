import {Heading, Text} from '@radix-ui/themes';
import ROUTES from '../constants/Routes';
import {useNavigate} from 'react-router-dom';
import SearchContainer from '../components/SearchContainer';
import {DATA} from '../constants/Data';
import Marquee from 'react-fast-marquee';
import Container from '../components/Container';
import {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {Quiz} from '../types';
import QuizPreview from '../components/QuizPreview';

interface MenuOptions {
  title: string;
  description?: string;
  onPress: () => void;
  hotkey?: string;
  className?: string;
}

const ANIMATION_DURATION = 0.15; // in second

function LandingScreen(): JSX.Element {
  const [searchResult, setSearchResult] = useState<Quiz[] | null>();
  const navigation = useNavigate();

  useEffect(() => {
    console.log(searchResult);
  }, [searchResult]);

  const transition = {
    duration: ANIMATION_DURATION,
    type: 'spring',
    mass: 0.05,
  };

  const animatedStates = {
    shown: {y: 0},
    hidden: {y: 1000},
  };

  const MENU_OPTIONS: MenuOptions[] = [
    {
      title: 'Todays top quizzes',
      description:
        "If you can't see anything you like, you can always search for it or even create it",
      onPress: () => navigation(ROUTES.listQuizzes),
      hotkey: 'T',
      className: 'bg-blue-400 w-full h-full border-blue-500',
    },
    {
      title: 'All Games',
      onPress: () => navigation(ROUTES.listQuizzes),
      hotkey: 'A',
      className: 'bg-green-500 border-green-900',
    },
    {
      title: 'Create Game',
      onPress: () => navigation(ROUTES.createQuiz),
      hotkey: 'C',
      className: 'bg-violet-500 border-violet-900 ',
    },
    {
      title: 'Leaderboard',
      onPress: () => navigation(ROUTES.createQuiz),
      hotkey: 'L',
      className: 'bg-red-500 border-red-900 col-span-2',
    },
  ];

  return (
    <div className="flex flex-col space-y-2 align-center bg-slate-950 w-full h-screen">
      <HeaderView className="mt-20" />
      <SearchContainer
        setSearchResult={setSearchResult}
        className="flex h-[50%] justify-center px-[30%]"
      />
      <motion.div
        animate={!searchResult ? 'hidden' : 'shown'}
        variants={animatedStates}
        transition={transition}
        className="flex absolute bottom-0 w-full max-w-screen-xl h-2/4 p-2">
        <Container
          title={'Search results'}
          description={MENU_OPTIONS[0].description}
          className={MENU_OPTIONS[0].className}
          content={searchResult?.map(quiz => (
            <QuizPreview quiz={quiz} defaultNavigation />
          ))}
        />
      </motion.div>
      <motion.div
        animate={searchResult ? 'hidden' : 'shown'}
        variants={animatedStates}
        transition={transition}
        className="flex max-w-screen-xl h-full space-x-2 p-2">
        <Container
          title={MENU_OPTIONS[0].title}
          description={MENU_OPTIONS[0].description}
          onClick={() => console.log('hello')}
          className="bg-blue-400 w-full h-full border-blue-500"
        />
        <div className="grid grid-cols-2 gap-2 w-full h-full">
          {MENU_OPTIONS.slice(1).map((option, index) => {
            return (
              <Container
                key={index}
                title={option.title}
                description={option.description}
                onClick={option.onPress}
                className={option.className}
              />
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function HeaderView({className}: {className: string}): JSX.Element {
  const {headerTags, artistList} = DATA;

  return (
    <div className={className}>
      <Marquee speed={45} className="min-h-20">
        {headerTags.map((h, i) => (
          <div key={i} className="flex items-center">
            <Heading size={'9'} weight={'bold'} className="text-white">
              {h.toUpperCase()}
            </Heading>
            <Text size={'7'} className="px-5">
              🎤
            </Text>
          </div>
        ))}
      </Marquee>
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
