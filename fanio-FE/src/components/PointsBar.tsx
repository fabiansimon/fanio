import {motion, useAnimation} from 'framer-motion';
import {forwardRef, useImperativeHandle, useState, Ref} from 'react';
import {UI} from '../utils/common';
import AnimatedText from './AnimatedText';
import {GAME_OPTIONS} from '../constants/Game';

interface PointsBarProps {
  className?: string;
}

export interface PointsBarRef {
  startAnimation: (length?: number) => void;
  setSongLength: (length: number) => void;
  clear: () => void;
}

function PointsBar(props: PointsBarProps, ref: Ref<PointsBarRef>) {
  const {className} = props;
  const [songLength, setSongLength] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const controls = useAnimation();

  const triggerAnimation = (length?: number) => {
    if (length) setSongLength(length);
    setIsPlaying(true);
    controls.set({width: '100%'});
    controls.start({
      width: 0,
      transition: {duration: length},
    });
  };

  const clear = () => {
    setIsPlaying(false);
    setSongLength(null);
    controls.set({width: '100%'});
  };

  useImperativeHandle(ref, () => ({
    startAnimation: (length?: number) => triggerAnimation(length),
    setSongLength: (length: number) => setSongLength(length),
    clear: () => clear(),
  }));

  return (
    <div className={UI.cn(className)}>
      {isPlaying && songLength && (
        <AnimatedText
          className="text-white"
          start={GAME_OPTIONS.MAX_POINTS_PER_ROUND}
          duration={songLength}
        />
      )}
    </div>
  );
}

export default forwardRef<PointsBarRef, PointsBarProps>(PointsBar);
