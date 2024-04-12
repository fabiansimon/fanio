import {Heading, Text} from '@radix-ui/themes';
import Button from './Button';
import {MinusIcon, PersonIcon, PlusIcon} from '@radix-ui/react-icons';
import {StrictMode, useCallback, useEffect, useMemo, useState} from 'react';
import {
  AchievementType,
  ButtonType,
  GameState,
  LocalScore,
  Score,
} from '../types';
import ScoreTile from './ScoreTile';
import {DateUtils, UI} from '../utils/common';
import EmptyContainer from './EmptyContainer';
import HoverContainer from './HoverContainer';
import {useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';
import {useStompClient} from 'react-stomp-hooks';
import ToastController from '../providers/ToastController';

function PreGameScene({
  quizId,
  topScore,
  lastAttempt,
  onChangeScene,
}: {
  quizId: string;
  topScore?: Score;
  lastAttempt?: LocalScore;
  onChangeScene: (state: GameState) => void;
}): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigate();
  const stompClient = useStompClient();

  const isWinner = useMemo(() => {
    if (!topScore || !lastAttempt) return false;
    return topScore?.totalScore < lastAttempt?.totalScore;
  }, [topScore, lastAttempt]);

  const {icon, textColor, backgroundColor} = useMemo(() => {
    return {
      textColor: isWinner ? 'text-green-700' : 'text-red-500',
      backgroundColor: isWinner ? 'bg-green-600' : 'bg-red-600',
      icon: isWinner ? (
        <MinusIcon className="text-white size-4" />
      ) : (
        <PlusIcon className="text-white size-4" />
      ),
    };
  }, [isWinner]);

  useEffect(() => {
    if (stompClient) {
      const subscription = stompClient.subscribe(
        '/user/queue/lobby-created',
        message => {
          setIsLoading(false);
          navigation(`${ROUTES.lobby}/${quizId}/${message.body}`);
        },
      );

      return () => subscription.unsubscribe();
    }
    return;
  }, [stompClient, navigation, quizId]);

  const createLobby = useCallback(() => {
    setIsLoading(true);
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/lobby/create',
        body: '',
      });
    } else {
      setIsLoading(false);
      console.error('WebSocket connection not established.');
      ToastController.showErrorToast(
        'Connection could not be established.',
        'Please try again later.',
      );
    }
  }, [stompClient]);

  const challengeFriendButton = () => (
    <Button
      icon={<PersonIcon className="text-white mr-2" />}
      onClick={createLobby}
      loading={isLoading}
      type={ButtonType.outline}
      text="Challenge Friend"
      className="flex absolute -bottom-12 w-full"
      textSize="2"
    />
  );

  if (!topScore) {
    return (
      <EmptyContainer
        className="my-auto relative"
        title="Get the ball rolling ⚽️"
        description="Be the first one to submit a highscore">
        <Button
          onClick={() => onChangeScene(GameState.PLAYING)}
          hotkey="Enter"
          ignoreMetaKey
          text="Start Quiz"
          className="flex w-full mt-4"
          textSize="2"
        />
        {challengeFriendButton()}
      </EmptyContainer>
    );
  }

  return (
    <>
      <HoverContainer className="my-auto px-4 py-4 mx-[20%] relative">
        <div className="space-y-3 w-full -mt-1">
          <Heading className="text-white" size={'3'}>
            Highscore to beat
          </Heading>
          <ScoreTile
            score={topScore}
            achievement={AchievementType.FIRST}
            position={1}
          />
          {lastAttempt && (
            <div className="space-y-2">
              <ScoreTile score={lastAttempt} />
              <div className="w-full border-[.2px] border-white/30" />
              <div className="flex items-center justify-end relative">
                <div className="flex flex-col text-right ml-2">
                  <Heading weight={'medium'} className={textColor} size={'3'}>
                    {UI.formatPoints(
                      topScore.totalScore - lastAttempt.totalScore,
                    )}
                  </Heading>
                  <Text className={textColor} size={'2'} weight={'regular'}>
                    {DateUtils.formatTime(
                      Math.abs(topScore.timeElapsed - lastAttempt.timeElapsed),
                      'sec',
                    )}
                  </Text>
                </div>
                <div
                  className={UI.cn(
                    'absolute -right-11 flex size-5 ml-3 items-center justify-center rounded-full',
                    backgroundColor,
                  )}>
                  {icon}
                </div>
              </div>
            </div>
          )}
        </div>
        <Button
          onClick={() => onChangeScene(GameState.PLAYING)}
          hotkey="Enter"
          ignoreMetaKey
          text="Start Quiz"
          className="flex flex-grow w-full mt-4"
          textSize="2"
        />
        {challengeFriendButton()}
      </HoverContainer>
    </>
  );
}

export default PreGameScene;
