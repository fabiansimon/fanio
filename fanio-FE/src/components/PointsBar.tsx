import {motion, useAnimation} from 'framer-motion';
import {forwardRef, useImperativeHandle, useState} from 'react';
import {UI} from '../utils/common';
import AnimatedText from './AnimatedText';
import {GAME_OPTIONS} from '../constants/Game';

function PointsBar({className}: {className?: string}, ref: any): JSX.Element {
  const [songLength, setSongLength] = useState<number | null>(null);
  const controls = useAnimation();

  const triggerAnimation = (length: number) => {
    setSongLength(length);

    controls.set({width: '100%'});

    controls.start({
      width: 0,
      transition: {duration: length},
    });
  };

  const clear = () => {
    setSongLength(null);
    controls.set({width: '100%'});
  };

  useImperativeHandle(ref, () => ({
    startAnimation: (length: number) => triggerAnimation(length),
    clear: () => clear(),
  }));

  return (
    <div
      className={UI.cn(
        'h-4 w-full relative overflow-hidden rounded-xl items-end justify-center flex flex-col px-1 bg-slate-950',
        className,
      )}>
      {songLength && (
        <AnimatedText
          className="text-white"
          start={GAME_OPTIONS.MAX_POINTS_PER_ROUND}
          duration={songLength}
        />
      )}
      <motion.div
        animate={controls}
        className="absolute left-0 top-0 h-4 movingGradient"
      />
    </div>
  );
}

export default forwardRef(PointsBar);
