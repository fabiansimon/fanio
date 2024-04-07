import {useEffect, useState} from 'react';

const MAX_MOBILE_WIDTH = 768;

function checkMobile(agent: string, width: number) {
  return (
    Boolean(
      agent.match(
        /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i,
      ),
    ) || width < MAX_MOBILE_WIDTH
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const agent = window.navigator.userAgent;
    setIsMobile(checkMobile(agent, window.innerWidth));

    const handleResize = () =>
      setIsMobile(checkMobile(agent, window.innerWidth));

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

export default useIsMobile;
