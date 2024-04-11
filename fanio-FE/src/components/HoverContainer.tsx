import {Heading, Text} from '@radix-ui/themes';
import Button from './Button';
import {UI} from '../utils/common';

interface HoverContainerProps extends React.HTMLProps<HTMLDivElement> {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  buttonText?: string;
}
function HoverContainer({
  title,
  description,
  className,
  children,
  buttonText,
  onClick,
}: HoverContainerProps): JSX.Element {
  return (
    <div
      className={UI.cn(
        'flex flex-col bg-neutral-900 border shadow-md shadow-black rounded-lg px-8 py-4 border-neutral-500/20 mx-auto items-center justify-center',
        className,
      )}>
      {title && (
        <Heading
          weight={'medium'}
          size={'3'}
          className="text-white/90 text-center">
          {title}
        </Heading>
      )}
      {description && (
        <Text size={'2'} className="text-white/50" weight={'light'}>
          {description}
        </Text>
      )}
      {onClick && buttonText && (
        <Button
          textSize="2"
          className="mt-4"
          text={buttonText}
          onClick={onClick}
        />
      )}
      {children}
    </div>
  );
}

export default HoverContainer;
