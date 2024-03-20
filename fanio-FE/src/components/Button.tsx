import {Button as RadixButton, Kbd, Text} from '@radix-ui/themes';
import useKeyShortcut from '../hooks/useKeyShortcut';
import KeyBinding from './KeyBinding';
import {UI} from '../utils/common';

interface ButtonProps extends React.HTMLProps<HTMLDivElement> {
  hotkey?: string;
  children?: React.ReactNode;
  disabled: boolean;
  rest: any;
  text?: string;
  ignoreMetaKey: boolean;
  className?: string;
}

function Button({
  hotkey,
  children,
  disabled = false,
  text,
  ignoreMetaKey = false,
  className,
  ...rest
}: any): JSX.Element {
  return (
    <button
      disabled={disabled}
      onClick={rest.onClick}
      className={UI.cn(
        'bg-primary-700 flex bg-blue-600 px-10 py-2 rounded-xl items-center justify-center',
        className,
      )}>
      <Text size={'3'} className="text-white">
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
    </button>
  );
}

export default Button;
