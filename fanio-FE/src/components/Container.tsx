import {Heading, Text} from '@radix-ui/themes';
import {UI} from '../utils/common';
import {title} from 'process';

interface ContainerProps {
  title?: string;
  description?: string;
  content?: React.ReactNode;
  className?: string;
  color?: string;
  onClick?: () => void;
}

function Container({
  className,
  onClick,
  title,
  description,
  content,
}: ContainerProps): JSX.Element {
  return (
    <div
      onClick={onClick}
      className={UI.cn(
        'rounded-3xl shadow-2xl flex border-2 flex-col px-5 py-4',
        onClick &&
          'hover:scale-[98%] transition-transform duration-150 ease-in-out cursor-pointer',
        className,
      )}>
      <Heading size={'4'} className="text-white">
        {title}
      </Heading>
      <Text className="text-white pt-1 max-w-[80%]" size={'2'}>
        {description}
      </Text>
      {content && content}
    </div>
  );
}

export default Container;
