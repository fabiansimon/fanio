import {Kbd} from '@radix-ui/themes';
import useKeyShortcut from '../hooks/useKeyShortcut';
import useDetectOS from '../hooks/useDetectOS';
import {useMemo} from 'react';
import {OperationSystem} from '../types';
import useIsMobile from '../hooks/useIsMobile';
import {UI} from '../utils/common';

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
  const isMobile = useIsMobile();

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

  if (isMobile) return <div />;
  return <Kbd className={UI.cn(className)}>{`${metaKey}${hotkey}`}</Kbd>;
}

export default KeyBinding;
