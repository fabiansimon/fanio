import {Text} from '@radix-ui/themes';
import Avatar from './Avatar';
import {UI} from '../utils/common';
import {PlayIcon} from '@radix-ui/react-icons';
import Chip from './Chip';
import {ChipType, Quiz, UserData} from '../types';
import {useMemo} from 'react';

function GameDetailsContainer({
  className,
  quiz,
}: {
  className?: string;
  quiz: Quiz & {creator: UserData};
}): JSX.Element {
  const {
    isPrivate,
    randomOffsets,
    totalPlays,
    creator: {firstName, lastName},
  } = quiz;
  const detailsData = useMemo(
    () => [
      {
        title: 'Created By',
        content: (
          <div className="flex space-x-2 items-end">
            <Avatar user={quiz.creator} className="size-6" />
            <Text size={'2'} className="text-white">
              {UI.formatName({firstName, lastName})}
            </Text>
            ,
          </div>
        ),
      },
      {
        title: 'Quiz Options',
        content: (
          <div className="flex space-x-2 items-end">
            <div className="flex space-x-1">
              {isPrivate ? (
                <Chip type={ChipType.PRIVATE} />
              ) : (
                <Chip type={ChipType.PUBLIC} />
              )}
              {randomOffsets && <Chip type={ChipType.RANDOM_TIMESTAMPS} />}
            </div>
          </div>
        ),
      },
      {
        title: 'Total Plays',
        content: (
          <div className="flex space-x-2 items-end ml-auto">
            <PlayIcon className="text-white mb-[2px]" />
            <Text size={'2'} className="text-white">
              {totalPlays || 0}
            </Text>
            ,
          </div>
        ),
      },
    ],
    [isPrivate, randomOffsets, totalPlays],
  );

  return (
    <div
      className={UI.cn(
        'flex w-full border-neutral-500/30 border rounded-lg justify-between px-3 py-2 shadow-md shadow-black/50',
        className,
      )}>
      {detailsData.map(({title, content}, i) => {
        const textAlign = ['text-left', 'text-center', 'text-right'][i % 3];
        return (
          <div key={i} className="flex flex-col space-y-2 justify-around">
            <Text className={UI.cn('text-white/60', textAlign)} size={'1'}>
              {title}
            </Text>
            {content}
          </div>
        );
      })}
    </div>
  );
}

export default GameDetailsContainer;
