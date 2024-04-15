import {Dispatch, SetStateAction, useEffect} from 'react';
import {GameSettingKey, GameSettings} from '../types';
import {Checkbox, Text} from '@radix-ui/themes';
import KeyBinding from './KeyBinding';

function QuickOptionsContainer({
  settings,
  setSettings,
  disabled,
  isLobby,
}: {
  isLobby: boolean;
  settings: GameSettings;
  setSettings: Dispatch<SetStateAction<GameSettings>>;
  disabled: boolean;
}): JSX.Element {
  useEffect(() => {
    if (isLobby) {
      setSettings(prev => {
        return {
          ...prev,
          autoPlay: {
            ...prev.autoPlay,
            status: false,
          },
        };
      });
    }
  }, [isLobby, setSettings]);

  const handleChange = (key: GameSettingKey, value: boolean) => {
    if (disabled || (isLobby && key === 'autoPlay')) return;
    setSettings(prev => {
      return {
        ...prev,
        [key]: {
          ...prev[key],
          status: value,
        },
      };
    });
  };

  return (
    <div className="flex justify-between">
      {Object.entries(settings).map(([key, option], index) => {
        const {title, description, status} = option;
        const optionKey = key as GameSettingKey;
        return (
          <div className="flex justify-center space-x-2 px-3" key={key}>
            <Checkbox
              checked={status}
              style={{opacity: status || 0.2}}
              size={'1'}
              onCheckedChange={value =>
                handleChange(optionKey, value as boolean)
              }
            />
            <div className="flex flex-col -mt-1.5">
              <div className="space-x-1.5 mb-1">
                <Text size={'2'} weight={'medium'} className="text-white/90">
                  {title}
                </Text>
                <KeyBinding
                  className="size-4 mt-1"
                  textClassName="text-[10px]"
                  hotkey={['C', 'J', 'B'][index]}
                  onActivate={() => handleChange(optionKey, !status)}
                />
              </div>
              <Text size={'1'} className="text-white/50">
                {description}
              </Text>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default QuickOptionsContainer;
