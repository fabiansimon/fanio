import {useEffect} from 'react';

function useKeyShortcut(hotkey: string, action: () => void): void {
  useEffect(() => {
    if (!hotkey) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === hotkey.toLowerCase()) action();
    };
    window.addEventListener('keypress', handleKeyDown);

    return () => window.removeEventListener('keypress', handleKeyDown);
  }, [hotkey, action]);
}

export default useKeyShortcut;
