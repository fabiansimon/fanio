import React, {useMemo} from 'react';
import {Button as RadixButton, Kbd, Text, Responsive} from '@radix-ui/themes';
import useKeyShortcut from '../hooks/useKeyShortcut';
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
    if (type === ButtonType.outline)
      return 'bg-transparent border border-neutral-700';

    return 'bg-blue-600';
  }, [type]);

  return (
    <button
      {...rest}
      disabled={disabled}
      className={UI.cn(
        `flex px-10 py-2 rounded-xl items-center justify-center ${
          disabled && 'opacity-50'
        }`,
        customClass,
        className,
      )}>
      {loading ? (
        <Loading className="size-6" />
      ) : (
        <>
          {icon && icon}
          <Text size={textSize} className="text-white">
            {text}
          </Text>
          {children}
          {hotkey && !disabled && (
            <KeyBinding
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
