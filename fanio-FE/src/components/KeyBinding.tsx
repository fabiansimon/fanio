import {Kbd} from '@radix-ui/themes';
import useKeyShortcut from '../hooks/useKeyShortcut';
import useDetectOS from '../hooks/useDetectOS';
import {useMemo} from 'react';
import {OperationSystem} from '../types';

function KeyBinding({
  disabled,
  hotkey,
  onActivate,
  ignoreMetaKey,
  className,
}: {
  disabled?: boolean;
  hotkey: string;
  onActivate?: () => void;
  ignoreMetaKey?: boolean;
  className?: string;
}): JSX.Element {
  useKeyShortcut(
    hotkey,
    () => onActivate && !disabled && onActivate(),
    ignoreMetaKey,
  );
  const OS = useDetectOS();

  const metaKey = useMemo(() => {
    if (ignoreMetaKey) return '';
    if (OS === OperationSystem.IOS || OS === OperationSystem.ANDROID) return;
    if (OS === OperationSystem.MAC) return '⌘';
    return 'Ctrl';
  }, [OS, ignoreMetaKey]);

  return <Kbd className={className}>{`${metaKey}${hotkey}`}</Kbd>;
}

export default KeyBinding;
