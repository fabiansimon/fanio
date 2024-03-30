import {BreakPoint} from '../types';
import {useEffect, useState} from 'react';

const breakpointsData = {
  [BreakPoint.SM]: 640,
  [BreakPoint.MD]: 768,
  [BreakPoint.LG]: 1024,
  [BreakPoint.XL]: 1280,
  [BreakPoint.XXL]: 1536,
};

export default function useBreakingPoints(breakpoint: BreakPoint): boolean {
  const [breakActive, setBreakActive] = useState<boolean>(
    window.innerWidth < breakpointsData[breakpoint],
  );

  useEffect(() => {
    const handleResize = () => {
      const {innerWidth: width} = window;
      setBreakActive(width <= breakpointsData[breakpoint]);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return breakActive;
}
