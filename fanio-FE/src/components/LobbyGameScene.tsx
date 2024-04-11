import {Heading, Text} from '@radix-ui/themes';
import Button from './Button';
import HoverContainer from './HoverContainer';
import {CopyIcon} from '@radix-ui/react-icons';
import ToastController from '../providers/ToastController';
import {useEffect, useState} from 'react';
import Loading from './Loading';

function LobbyGameScene({}: {}): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    ToastController.showSuccessToast(
      'Copied',
      'It is saved in your clipboard.',
    );
  };
  return (
    <>
      <HoverContainer className="my-auto px-4 py-4 mx-[20%] relative space-y-4">
        <div className="space-y-3 w-full -mt-1">
          <Heading className="text-white" size={'3'}>
            Challenge Your Friends
          </Heading>
          <Text className="text-white/60" size={'2'}>
            Send them this link to join the lobby
          </Text>
        </div>

        <div
          onClick={copyLink}
          className="w-full cursor-pointer bg-black/40 rounded-md py-2 px-3 flex items-center">
          {isLoading ? (
            <Loading className="text-white mx-auto my-1" />
          ) : (
            <>
              <Text size="1" className="text-white/60">
                {window.location.href}
              </Text>
              <CopyIcon className="text-white/90 size-5" />
            </>
          )}
        </div>
        <Button
          hotkey="Enter"
          ignoreMetaKey
          disabled
          text="Start Quiz"
          className="flex flex-grow w-full"
          textSize="2"
        />
      </HoverContainer>
    </>
  );
}

export default LobbyGameScene;
