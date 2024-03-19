import {Kbd} from '@radix-ui/themes';
import useKeyShortcut from '../hooks/useKeyShortcut';
import useDetectOS from '../hooks/useDetectOS';
import {useMemo} from 'react';
import {OperationSystem} from '../types';

function KeyBinding({
  hotkey,
  onActivate,
}: {
  hotkey: string;
  onActivate?: () => void;
}): JSX.Element {
  useKeyShortcut(hotkey, () => onActivate && onActivate());
  const OS = useDetectOS();

  const metaKey = useMemo(() => {
    if (OS === OperationSystem.IOS || OS === OperationSystem.ANDROID) return;
    if (OS === OperationSystem.MAC) return '⌘';
    return 'Ctrl';
  }, [OS]);

  return <Kbd>{`${metaKey}${hotkey}`}</Kbd>;
}

export default KeyBinding;
