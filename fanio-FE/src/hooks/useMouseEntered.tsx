import {RefObject, useEffect, useState} from 'react';

function useMouseEntered<T extends HTMLElement>(ref: RefObject<T>) {
  const [mouseEntered, setMouseEntered] = useState<boolean>(false);

  useEffect(() => {
    const node = ref.current;
    const handleMouseEnter = () => setMouseEntered(true);
    const handleMouseLeave = () => setMouseEntered(false);
    if (node) {
      node.addEventListener('mouseenter', handleMouseEnter);
      node.addEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
      if (node) {
        node.removeEventListener('mouseenter', handleMouseEnter);
        node.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [ref]);

  return mouseEntered;
}

export default useMouseEntered;
