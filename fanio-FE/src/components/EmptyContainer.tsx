import {Heading, Text} from '@radix-ui/themes';
import Button from './Button';
import {UI} from '../utils/common';
import HoverContainer from './HoverContainer';

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
    <HoverContainer
      title={title}
      description={description}
      className={className}
      onClick={onClick}
      buttonText={buttonText}>
      {children}
    </HoverContainer>
  );
}

export default EmptyContainer;
