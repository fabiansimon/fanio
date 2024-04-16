import {useEffect, useState} from 'react';
import useBreakingPoints from './useBreakingPoints';
import {BreakPoint} from '../types';
import useIsMobile from './useIsMobile';

function useIsSmall() {
  const [isSmall, setIsSmall] = useState<boolean>(false);

  const breakTriggered = useBreakingPoints(BreakPoint.SM);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsSmall(breakTriggered || isMobile);
  }, [breakTriggered, isMobile]);

  return isSmall;
}

export default useIsSmall;
