import {useEffect} from 'react';

function useKeyShortcut(hotkey: string, action: () => void): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === hotkey) action();
    };
    window.addEventListener('keypress', handleKeyDown);

    return () => window.removeEventListener('keypress', handleKeyDown);
  }, [hotkey, action]);
}

export default useKeyShortcut;
