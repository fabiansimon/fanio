import {Heading, Text} from '@radix-ui/themes';
import Button from './Button';
import {UI} from '../utils/common';

interface EmptyContainerProps extends React.HTMLProps<HTMLDivElement> {
  title?: string;
  description?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  buttonText?: string;
}
function EmptyContainer({
  title = "💨 Hm, it's pretty empty here",
  description,
  className,
  children,
  onClick,
  buttonText,
}: EmptyContainerProps): JSX.Element {
  return (
    <div
      className={UI.cn(
        'flex flex-col bg-black/20 border shadow-md shadow-black rounded-lg px-8 py-4 border-neutral-500/20 mx-auto items-center justify-center',
        className,
      )}>
      <Heading
        weight={'medium'}
        size={'3'}
        className="text-white/90 text-center">
        {title}
      </Heading>
      <Text size={'2'} className="text-white/50" weight={'light'}>
        {description}
      </Text>
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

export default EmptyContainer;
