import {Button as RadixButton, Kbd} from '@radix-ui/themes';
import useKeyShortcut from '../hooks/useKeyShortcut';

interface ButtonProps extends React.HTMLProps<HTMLDivElement> {
  hotkey?: string;
  children?: React.ReactNode;
  rest: any;
}

function Button({hotkey, children, ...rest}: any): JSX.Element {
  useKeyShortcut(hotkey, () => rest.onClick());

  return (
    <RadixButton size="3" radius="medium" {...rest}>
      {children}
      {hotkey && <Kbd>{hotkey}</Kbd>}
    </RadixButton>
  );
}

export default Button;
