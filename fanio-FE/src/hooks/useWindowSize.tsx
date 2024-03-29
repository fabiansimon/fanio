import {useEffect, useState} from 'react';
import {BreakPoint} from '../types';

interface WindowSize {
  width: number;
  height: number;
}

const breakpointsData = {
  [BreakPoint.SM]: 640,
  [BreakPoint.MD]: 768,
  [BreakPoint.LG]: 1024,
  [BreakPoint.XL]: 1280,
  [BreakPoint.XXL]: 1536,
};

function getWindowSize(): WindowSize {
  const {innerWidth: width, innerHeight: height} = window;
  return {
    width,
    height,
  };
}

export default function useWindowSize({
  breakpoint,
}: {
  breakpoint?: BreakPoint;
}): {windowSize: WindowSize; breakTriggered: boolean} {
  const [windowSize, setWindowSize] = useState<WindowSize>(getWindowSize());
  const [breakTriggered, setBreakTriggered] = useState<boolean>(() => {
    const {width} = getWindowSize();
    return width < breakpointsData[breakpoint as BreakPoint];
  });

  useEffect(() => {
    const handleResize = () => {
      const {width, height} = getWindowSize();
      if (breakpoint) {
        setBreakTriggered(width < breakpointsData[breakpoint as BreakPoint]);
      }
      setWindowSize({width, height});
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {windowSize, breakTriggered};
}
