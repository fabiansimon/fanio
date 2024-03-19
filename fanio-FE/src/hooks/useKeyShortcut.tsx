import {useEffect} from 'react';
import useDetectOS from './useDetectOS';
import {OperationSystem} from '../types';

function useKeyShortcut(hotkey: string, action: () => void): void {
  const OS = useDetectOS();

  useEffect(() => {
    if (!hotkey) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const metaDown = OS === OperationSystem.MAC ? e.metaKey : e.ctrlKey;
      if (metaDown && e.key.toLowerCase() === hotkey.toLowerCase()) action();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotkey, action, OS]);
}

export default useKeyShortcut;
