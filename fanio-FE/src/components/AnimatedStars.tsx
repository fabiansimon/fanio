import {useCallback, useEffect, useState} from 'react';

function AnimatedStars(): JSX.Element {
  const [stars, setStars] = useState<{y: number; x: number; id: number}[]>([]);

  const triggerStar = useCallback(() => {
    const newId = Date.now();
    setStars(prev =>
      prev.concat({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        id: newId,
      }),
    );

    const timeout = setTimeout(() => {
      setStars(prev => prev.filter(star => star.id !== newId));
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', triggerStar);
    return () => window.removeEventListener('keydown', triggerStar);
  }, [triggerStar]);

  return (
    <div>
      {stars.map(star => (
        <img
          key={star.id}
          src="/firework.gif"
          className="absolute rounded-full size-20 z-20"
          style={{left: star.x, top: star.y}}
          alt="firework gif"
        />
      ))}
    </div>
  );
}

export default AnimatedStars;
