import {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {UI} from '../utils/common';
import {Text} from '@radix-ui/themes';

interface AnimatedTextProps {
  className?: string;
  stepAmount?: number;
  start: number;
  duration: number;
}

function AnimatedText({
  className,
  start,
  stepAmount = 1,
  duration,
}: AnimatedTextProps): JSX.Element {
  const [count, setCount] = useState<number>(start);

  useEffect(() => {
    setCount(start);
  }, [duration, start]);

  useEffect(() => {
    if (count <= 0) return;

    const intervalDelay = (duration * 1000) / start;
    const interval = setInterval(() => {
      setCount(prev => prev - stepAmount);
    }, intervalDelay);

    return () => clearInterval(interval);
  }, [count, duration, start, stepAmount]);

  return (
    <Text size={'1'} className={UI.cn('', className)}>
      {count}
    </Text>
  );
}

export default AnimatedText;
