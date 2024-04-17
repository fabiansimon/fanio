import {Heading, Switch, Text} from '@radix-ui/themes';
import {InputType} from '../pages/CreateScreen';
import {UI} from '../utils/common';
import useIsSmall from '../hooks/useIsSmall';

function OptionsContainer({
  className,
  onInput,
}: {
  className?: string;
  onInput: (value: boolean, type: InputType) => void;
}): JSX.Element {
  const isSmall = useIsSmall();

  return (
    <div
      className={UI.cn(
        'flex border-neutral-500/20 border rounded-xl p-3 flex-col md:flex-row space-y-3 md:space-y-0',
        className,
      )}>
      <div className="flex-col flex-grow w-full">
        <div className="flex space-x-2">
          <Heading className="text-white/80" size={'2'}>
            Random Song Start
          </Heading>
          <Switch
            size="1"
            style={{
              backgroundColor: UI.addAlpha('#ffffff', 0.2),
              borderRadius: 100,
            }}
            className="text-white"
            onCheckedChange={value =>
              onInput(value, InputType.RANDOM_TIMESTAMP)
            }
          />
        </div>
        {!isSmall && (
          <Text className="text-white/50" size={'2'}>
            Each Song will start at a random timestamp.
          </Text>
        )}
      </div>
      {!isSmall && (
        <div className="border-l-neutral-500/20 border-l-[1px] pl-4" />
      )}
      <div className={'flex-col flex-grow w-full'}>
        <div className="flex space-x-2">
          <Heading className="text-white/80" size={'2'}>
            Private Quiz
          </Heading>
          <Switch
            size="1"
            style={{
              backgroundColor: UI.addAlpha('#ffffff', 0.2),
              borderRadius: 100,
            }}
            onCheckedChange={value => onInput(value, InputType.PRIVATE_QUIZ)}
          />
        </div>
        {!isSmall && (
          <Text className="text-white/50" size={'2'}>
            The Quiz can only be accessed through a shared URL.
          </Text>
        )}
      </div>
    </div>
  );
}

export default OptionsContainer;
