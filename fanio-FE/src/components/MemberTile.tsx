import {CheckIcon, Cross2Icon, PersonIcon} from '@radix-ui/react-icons';
import {LobbyMember} from '../types';
import {Text} from '@radix-ui/themes';
import {useMemo} from 'react';
import {UI} from '../utils/common';

function MemberTile({
  member,
  isDone,
  isSelf,
}: {
  member: LobbyMember;
  isDone: boolean;
  isSelf: boolean;
}): JSX.Element {
  const {userName} = member;

  const {backgroundColor, textColor, string, icon} = useMemo(() => {
    const textColor = isDone ? 'text-green-500' : 'text-red-400';
    return {
      textColor,
      backgroundColor: isDone ? 'bg-green-700/50' : 'bg-red-700/50',
      string: isDone ? 'Ready' : 'Not ready',
      icon: isDone ? (
        <CheckIcon className={textColor} />
      ) : (
        <Cross2Icon className={textColor} />
      ),
    };
  }, [isDone]);

  return (
    <div className="flex w-full justify-between items-center">
      <div className="flex items-center">
        {isSelf && <PersonIcon className="text-white mr-1" />}
        <Text size={'2'} weight={'medium'} className="text-white">
          {userName}
        </Text>
      </div>
      <div
        className={UI.cn(
          'rounded-md flex items-center h-7 justify-center px-2 space-x-1',
          backgroundColor,
        )}>
        <Text size={'1'} weight={'medium'} className={textColor}>
          {string}
        </Text>
        {icon}
      </div>
    </div>
  );
}

export default MemberTile;
