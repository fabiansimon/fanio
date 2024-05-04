import {CheckIcon, Cross2Icon, QuestionMarkIcon} from '@radix-ui/react-icons';
import {Text} from '@radix-ui/themes';
import {useMemo} from 'react';
import {UI} from '../utils/common';
import {StatusType} from '../types';

function ValidationChip({
  status,
  text,
  onClick,
  className,
  ignoreIcon,
}: {
  status: StatusType;
  ignoreIcon?: boolean;
  onClick?: () => void;
  text?: string;
  className?: string;
}): JSX.Element {
  const {icon, backgroundColor, textColor} = useMemo(() => {
    const textColor = [
      'text-white/30',
      'text-green-500/80',
      'text-red-500/90',
      'text-orange-500/90',
    ][status];

    return {
      textColor,
      icon: [
        <QuestionMarkIcon className={UI.cn(textColor)} />,
        <CheckIcon className={UI.cn(textColor)} />,
        <Cross2Icon className={UI.cn(textColor)} />,
      ][status],
      backgroundColor: [
        'bg-neutral-500/30',
        'bg-green-500/30',
        'bg-red-500/30',
        'bg-orange-500/30',
      ][status],
    };
  }, [status]);
  return (
    <div
      onClick={onClick}
      className={UI.cn(
        'flex px-2 py-1 items-center rounded-md space-x-2',
        !text && 'size-6 justify-center',
        onClick && 'cursor-pointer',
        className,
        backgroundColor,
      )}>
      {!ignoreIcon && <div>{icon}</div>}
      {text && (
        <Text size={'1'} weight={'medium'} className={UI.cn(textColor)}>
          {text}
        </Text>
      )}
    </div>
  );
}

export default ValidationChip;
