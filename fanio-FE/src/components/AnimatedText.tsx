import {useEffect, useMemo, useState} from 'react';
import {UI} from '../utils/common';
import {Text} from '@radix-ui/themes';
import {Responsive} from '@radix-ui/themes/dist/cjs/props';

interface AnimatedTextProps {
  className?: string;
  stepAmount?: number;
  to?: number;
  duration?: number;
  textSize?: Responsive<
    '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | undefined
  >;
  from: number;
}

function AnimatedText({
  className,
  from,
  to = 0,
  stepAmount = 1,
  duration = 2000,
  textSize = '2',
}: AnimatedTextProps): JSX.Element {
  const [count, setCount] = useState<number>(from);

  const positiveIncrease = useMemo(() => to > from, [to, from]);

  useEffect(() => {
    setCount(from);
  }, [duration, from]);

  useEffect(() => {
    if ((count <= 0 && !positiveIncrease) || (count >= to && positiveIncrease))
      return;

    const intervalDelay = (duration * 1000) / from;
    const interval = setInterval(() => {
      setCount(prev => prev - stepAmount);
    }, intervalDelay);

    return () => clearInterval(interval);
  }, [count, duration, from, stepAmount, positiveIncrease, to]);

  return (
    <Text size={textSize} className={UI.cn('', className)}>
      {count}
    </Text>
  );
}

export default AnimatedText;
