import {Button as RadixButton, Kbd} from '@radix-ui/themes';
import useKeyShortcut from '../hooks/useKeyShortcut';

interface ButtonProps extends React.HTMLProps<HTMLDivElement> {
  hotkey?: string;
  children?: React.ReactNode;
  rest: any;
  disabled: boolean;
}

function Button({
  hotkey,
  children,
  disabled = false,
  ...rest
}: any): JSX.Element {
  useKeyShortcut(hotkey, () => !disabled && rest.onClick());

  return (
    <RadixButton disabled={disabled} size={'2'} radius="medium" {...rest}>
      {children}
      {hotkey && !disabled && <Kbd>{hotkey}</Kbd>}
    </RadixButton>
  );
}

export default Button;
