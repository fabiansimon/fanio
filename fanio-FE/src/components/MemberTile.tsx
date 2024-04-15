import {CheckIcon, Cross2Icon, PersonIcon} from '@radix-ui/react-icons';
import {LobbyMember} from '../types';
import {Text} from '@radix-ui/themes';
import {useMemo} from 'react';
import {UI} from '../utils/common';
import PlaceContainer from './PlaceContainer';

function MemberTile({
  member,
  isDone,
  isSelf,
  showPoints,
  position,
}: {
  member: LobbyMember;
  isDone: boolean;
  showPoints?: boolean;
  isSelf: boolean;
  position?: number;
}): JSX.Element {
  const {userName, totalScore} = member;

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
    <div className="flex w-full justify-between items-center relative">
      <div className="flex">
        {position && <PlaceContainer className="-mr-2" position={position} />}
        <div className="flex items-center">
          {isSelf && <PersonIcon className="text-white mr-1" />}
          <Text size={'2'} weight={'medium'} className="text-white">
            {userName}
          </Text>
        </div>
      </div>
      {showPoints && (
        <div className="absolute flex flex-grow w-full justify-center">
          <Text size={'2'} weight={'bold'} className="text-white">
            {UI.formatPoints(totalScore)}
          </Text>
        </div>
      )}
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
