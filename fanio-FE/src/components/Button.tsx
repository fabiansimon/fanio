import React, {useMemo} from 'react';
import {Button as RadixButton, Kbd, Text} from '@radix-ui/themes';
import KeyBinding from './KeyBinding';
import {UI} from '../utils/common';
import {ButtonType} from '../types';
import Loading from './Loading';

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  hotkey?: string;
  textSize?: string;
  type?: ButtonType;
  text?: string;
  loading?: boolean;
  ignoreMetaKey?: boolean;
}

function Button({
  hotkey,
  loading,
  children,
  disabled = false,
  text,
  ignoreMetaKey = false,
  textSize = '3',
  type,
  icon,
  className,
  ...rest
}: any): JSX.Element {
  const customClass = useMemo(() => {
    switch (type) {
      case ButtonType.outline:
        return 'bg-transparent border border-neutral-700';

      case ButtonType.secondary:
        return 'bg-slate-500/30 border border-neutral-700';

      case ButtonType.text:
        return 'bg-transparent';

      default:
        break;
    }

    return 'bg-blue-600';
  }, [type]);

  return (
    <button
      {...rest}
      disabled={disabled}
      className={UI.cn(
        'flex md:max-px-10 px-2 py-2 rounded-xl items-center justify-center space-x-2',
        disabled && 'opacity-50',
        customClass,
        className,
      )}>
      {loading ? (
        <Loading className="text-white size-5" />
      ) : (
        <>
          {icon && icon}
          <Text size={textSize} className="line-clamp-1 text-white/90">
            {text}
          </Text>
          {children}
          {hotkey && (
            <KeyBinding
              disabled={disabled}
              className="ml-2"
              onActivate={rest.onClick}
              hotkey={hotkey}
              ignoreMetaKey={ignoreMetaKey}
            />
          )}
        </>
      )}
    </button>
  );
}

export default Button;
