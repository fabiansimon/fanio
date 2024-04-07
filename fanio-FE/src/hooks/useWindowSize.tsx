import {useEffect, useState} from 'react';

interface WindowSize {
  width: number;
  height: number;
}

function getWindowSize(): WindowSize {
  const {innerWidth: width, innerHeight: height} = window;
  return {
    width,
    height,
  };
}

function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>(getWindowSize());

  useEffect(() => {
    const handleResize = () => {
      const {width, height} = getWindowSize();
      setWindowSize({width, height});
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

export default useWindowSize;
