import {Heading, Switch, Text} from '@radix-ui/themes';
import {UI} from '../utils/common';

export function OptionsContainer({
  className,
}: {
  className?: string;
}): JSX.Element {
  return (
    <div
      className={UI.cn(
        'flex border-neutral-500/20 border shadow-mdshadow-black rounded-xl p-3',
        className,
      )}>
      <div className="flex-col flex-grow w-full">
        <div className="flex space-x-2">
          <Heading className="text-white/80" size={'2'}>
            Random Song Start
          </Heading>
          v
          <Switch size="1" defaultChecked />
        </div>
        <Text className="text-white/50" size={'2'}>
          Each Song will start at a random timestamp
        </Text>
      </div>
      <div className="flex-col flex-grow w-full border-l-neutral-500/20 border-l-[1px] pl-4">
        <div className="flex space-x-2">
          <Heading className="text-white/80" size={'2'}>
            Private Quiz
          </Heading>
          <Switch size="1" defaultChecked className="bg-white/20" />
        </div>
        <Text className="text-white/50" size={'2'}>
          Quiz can only be accessed through a shared URL
        </Text>
      </div>
    </div>
  );
}
