import {Heading, Text} from '@radix-ui/themes';
import {ArrowLeftIcon} from '@radix-ui/react-icons';
import {UI} from '../utils/common';
import useKeyShortcut from '../hooks/useKeyShortcut';
import KeyBinding from './KeyBinding';
import useIsSmall from '../hooks/useIsSmall';

interface ContainerProps {
  hotkey?: string;
  title?: string;
  titleColor?: string;
  description?: string;
  descriptionColor?: string;
  content?: React.ReactNode;
  className?: string;
  color?: string;
  onClick?: () => void;
  onBack?: () => void;
}

function Container({
  hotkey,
  className,
  onClick,
  title,
  titleColor = 'text-white',
  description,
  descriptionColor = 'text-white/80',
  content,
  onBack,
}: ContainerProps): JSX.Element {
  useKeyShortcut(hotkey!, () => onClick && onClick());
  const isSmall = useIsSmall();

  return (
    <div
      onClick={onClick}
      className={UI.cn(
        'rounded-3xl shadow-2xl border-2 flex-col px-5 py-4 overflow-hidden',
        onClick &&
          'hover:scale-[98%] transition-transform duration-150 ease-in-out cursor-pointer',
        className,
      )}>
      <div className="flex justify-between">
        <div>
          {onBack && (
            <div
              onClick={onBack}
              className="flex cursor-pointer absolute items-center top-[-24px] left-[22px] text-white">
              <ArrowLeftIcon className="size-6 text-white mr-1" />
              <Text>Back</Text>
            </div>
          )}
          <Heading size={'4'} className={UI.cn(titleColor)}>
            {title}
          </Heading>
        </div>
        {hotkey && (
          <KeyBinding
            className="mb-auto"
            hotkey={hotkey}
            onActivate={onClick}
          />
        )}
      </div>
      {!isSmall && (
        <Text
          className={UI.cn('pt-1 max-w-[80%]', descriptionColor)}
          size={'2'}>
          {description}
        </Text>
      )}
      {content && content}
    </div>
  );
}

export default Container;
