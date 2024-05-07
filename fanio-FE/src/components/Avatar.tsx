import {Text} from '@radix-ui/themes';
import {UserData} from '../types';
import {UI} from '../utils/common';
import {useMemo} from 'react';

function Avatar({
  user,
  className,
  onClick,
}: {
  user: UserData;
  className?: string;
  onClick?: () => void;
}): JSX.Element {
  const {firstName, lastName} = user;

  className = useMemo(() => {
    return UI.cn(
      'rounded-full size-10 overflow-hidden bg-neutral-400 items-center justify-center flex',
      onClick && 'cursor-pointer',
      className,
    );
  }, [className, onClick]);

  if (true) {
    return (
      <div onClick={onClick} className={className}>
        <Text
          size={'1'}
          weight={'medium'}
          className="text-white cursor-pointer">
          {UI.formatName({firstName, lastName, initals: true})}
        </Text>
      </div>
    );
  }

  return (
    <img
      onClick={onClick}
      src="https://i.pravatar.cc/300"
      alt="profile avatar"
      className={className}></img>
  );
}

export default Avatar;
