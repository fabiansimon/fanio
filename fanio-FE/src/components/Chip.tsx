import {LockClosedIcon} from '@radix-ui/react-icons';
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
};

function Chip({type}: {type: keyof typeof ChipData}): JSX.Element {
  const {title, icon, backgroundColor, textColor} = useMemo(
    () => ChipData[type],
    [type],
  );

  return (
    <div
      className={UI.cn(
        'p-1.5 rounded-lg items-center flex mb-auto space-x-1.5',
        backgroundColor,
      )}>
      {icon}
      <Text size={'1'} weight={'medium'} className={textColor}>
        {title}
      </Text>
    </div>
  );
}

export default Chip;
