import {Text} from '@radix-ui/themes';
import {UI} from '../utils/common';
import {useEffect, useState} from 'react';
import {GAME_OPTIONS} from '../constants/Game';

function MusicLoader({className}: {className: string}): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, GAME_OPTIONS.LOADING_THRESHOLD);
  }, []);

  return (
    <div
      className={UI.cn(
        'flex flex-col text-white h-20 space-y-9',
        className,
        isVisible ? 'opacity-1' : 'opacity-0',
      )}>
      <div className={UI.cn('spinner')}>
        <div className="r1"></div>
        <div className="r2"></div>
        <div className="r3"></div>
        <div className="r4"></div>
        <div className="r5"></div>
      </div>
      <Text size={'1'} className="text-center mr-5 text-white/60">
        Loading Song...
      </Text>
    </div>
  );
}

export default MusicLoader;
