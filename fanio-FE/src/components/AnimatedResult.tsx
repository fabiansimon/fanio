import {Heading, Text} from '@radix-ui/themes';
import {motion} from 'framer-motion';
import {GuessResult, Question} from '../types';
import {useEffect, useState} from 'react';
import {UI} from '../utils/common';
import {GAME_OPTIONS} from '../constants/Game';

const ANIMATION_DURATION = 200;

const transition = {
  duration: ANIMATION_DURATION,
  type: 'spring',
  mass: 0.05,
};

function AnimatedResult({
  result,
  question,
  className,
}: {
  result: GuessResult | undefined;
  className?: string;
  question: Question;
}): JSX.Element {
  const [animatedPoints, setAnimatePoints] = useState<boolean>(false);
  const [{title, link}, setText] = useState<{title: string; link: string}>({
    title: '',
    link: '',
  });

  useEffect(() => {
    if (result?.correct)
      setTimeout(() => {
        setAnimatePoints(true);
      }, GAME_OPTIONS.POINTS_UPDATE_TIMEOUT);

    setTimeout(
      () => {
        setText({
          title:
            result?.correct === true
              ? 'Correct ✅'
              : "Didn't get this one huh 🤔",
          link: question?.sourceTitle || question?.answer,
        });
        setAnimatePoints(false);
      },
      result ? 0 : 1000,
    );
  }, [result, question]);

  return (
    <motion.div
      initial="hidden"
      animate={result !== undefined ? 'visible' : 'hidden'}
      variants={{visible: {scale: 1}, hidden: {scale: 0}}}
      transition={transition}
      className={UI.cn(
        'flex flex-col flex-grow w-full items-center',
        className,
      )}>
      <Heading size={'4'} className="text-white">
        {title}
      </Heading>
      <div className="flex flex-grow w-full justify-center items-center">
        <Text
          size={'3'}
          className="text-white/60 overflow-hidden whitespace-nowrap">
          The answer was
        </Text>
        <a
          href={question.url}
          className="pl-1 text-blue-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[65%]"
          target="_blank"
          rel="noopener noreferrer">
          {link}
        </a>
      </div>
      <motion.div
        initial="fixed"
        variants={{fixed: {y: 0, scale: 1}, move: {y: 300, scale: 0.0}}}
        transition={{...transition, duration: ANIMATION_DURATION + 3000}}
        animate={animatedPoints ? 'move' : 'fixed'}>
        <Text size={'3'} className="text-white/60">
          {`+${UI.formatPoints(result?.points || 0, 'Points')}`}
        </Text>
      </motion.div>
    </motion.div>
  );
}

export default AnimatedResult;
