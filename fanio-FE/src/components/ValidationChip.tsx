import {CheckCircledIcon, CrossCircledIcon} from '@radix-ui/react-icons';
import {Text} from '@radix-ui/themes';
import {useMemo} from 'react';
import {UI} from '../utils/common';

function ValidationChip({
  text,
  className,
}: {
  text?: string;
  className?: string;
}): JSX.Element {
  const isValid = useMemo(() => {
    if (text) return false;
    return true;
  }, [text]);

  const {backgroundColor, icon} = useMemo(() => {
    return {
      backgroundColor: isValid ? 'bg-green-600' : 'bg-red-700',
      icon: isValid ? (
        <CheckCircledIcon className="text-white" />
      ) : (
        <CrossCircledIcon className="text-white" />
      ),
    };
  }, [isValid]);

  return (
    <div
      className={UI.cn(
        'flex px-2 py-1 items-center rounded-md',
        className,
        backgroundColor,
      )}>
      {icon}
      {text && (
        <Text size={'1'} weight={'medium'} className="pl-2 text-white">
          {text}
        </Text>
      )}
    </div>
  );
}

export default ValidationChip;
