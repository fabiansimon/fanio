import {
  LockClosedIcon,
  LockOpen1Icon,
  LockOpen2Icon,
  ShuffleIcon,
} from '@radix-ui/react-icons';
import {ChipType} from '../types';
import {useMemo} from 'react';
import {Text} from '@radix-ui/themes';
import {UI} from '../utils/common';

const ChipData = {
  [ChipType.PRIVATE]: {
    backgroundColor: 'bg-neutral-700/60',
    title: 'Private',
    icon: <LockClosedIcon className="text-white size-3" />,
    textColor: 'text-white',
  },
  [ChipType.PUBLIC]: {
    backgroundColor: 'bg-neutral-700/60',
    title: 'Public',
    icon: <LockOpen2Icon className="text-white size-3" />,
    textColor: 'text-white',
  },
  [ChipType.RANDOM_TIMESTAMPS]: {
    backgroundColor: 'bg-yellow-900',
    title: 'Random offset',
    icon: <ShuffleIcon className="text-white size-3" />,
    textColor: 'text-white',
  },
};

function Chip({
  type,
  className,
}: {
  type: keyof typeof ChipData;
  className?: string;
}): JSX.Element {
  const {title, icon, backgroundColor, textColor} = useMemo(
    () => ChipData[type],
    [type],
  );

  return (
    <div
      className={UI.cn(
        'py-1.5 px-2 rounded-lg h-8 items-center flex space-x-1.5',
        backgroundColor,
        className,
      )}>
      {icon}
      <Text size={'1'} weight={'medium'} className={textColor}>
        {title}
      </Text>
    </div>
  );
}

export default Chip;
