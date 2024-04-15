import {useBeforeUnload, useNavigate, useParams} from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import {useEffect, useMemo, useRef, useState} from 'react';
import {ButtonType, ChipType} from '../types';
import {motion} from 'framer-motion';
import {fetchInitLobbyData} from '../utils/api';
import {shuffle} from 'lodash';
import {Heading, Text} from '@radix-ui/themes';
import Chip from '../components/Chip';
import HoverContainer from '../components/HoverContainer';
import {useStompClient, useSubscription} from 'react-stomp-hooks';
import ToastController from '../controllers/ToastController';
import {CopyIcon} from '@radix-ui/react-icons';
import Button from '../components/Button';
import MemberTile from '../components/MemberTile';
import {GAME_OPTIONS} from '../constants/Game';
import InputField from '../components/InputField';
import QuizPreview from '../components/QuizPreview';
import {useLobbyContext} from '../providers/LobbyProvider';
import {LocalStorage} from '../utils/localStorage';
import ROUTES from '../constants/Routes';

const ANIMATION_DURATION = 200;

const transition = {
  duration: ANIMATION_DURATION,
  type: 'spring',
  mass: 0.05,
};

const ANIMATION_X_OFFSET = 3_000;
function LobbyScreen(): JSX.Element {
  const {
    exitLobby,
    setLobbyId,
    setMembers,
    setUserName,
    setUserData,
    setQuiz,
    updateSelf,
    userData: {userName, sessionToken, memberData},
    lobbyData: {quiz, members},
  } = useLobbyContext();

  const navigation = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isJoined, setIsJoined] = useState<boolean>(false);

  const {quizId, lobbyId} = useParams();

  const backgroundRef = useRef<any>(null);
  const stompClient = useStompClient();

  const isReady = useMemo(
    () => memberData.currRound === 0,
    [memberData.currRound],
  );

  // useBeforeUnload(exitLobby);

  useSubscription(`/topic/lobby/${lobbyId}/members`, message => {
    if (isLoading) {
      setIsLoading(false);
      setIsJoined(true);
    }
    setMembers(JSON.parse(message.body));
  });

  useSubscription(`/topic/lobby/${lobbyId}/data`, message => {
    console.log(message.body);
    if (JSON.parse(message.body) === 0)
      navigation(`${ROUTES.playQuiz}/${quizId}/${lobbyId}`);
  });

  useEffect(() => {
    setLobbyId(lobbyId!);
  }, [lobbyId, setLobbyId]);

  useEffect(() => {
    if (!quizId || !lobbyId) return;
    (async () => {
      try {
        const {quiz, topScore, lobby} = await fetchInitLobbyData({
          quizId,
          lobbyId,
        });

        if (!lobby) {
          return ToastController.showErrorToast(
            'Lobby not found',
            'Make sure your link/Lobby ID is correct.',
          );
        }

        const savedToken = LocalStorage.fetchSessionToken();

        if (savedToken && lobby.members[savedToken]) {
          setUserData({
            sessionToken: savedToken,
            memberData: lobby.members[savedToken],
            userName: lobby.members[savedToken].userName,
          });
          setMembers(lobby.membersAsList);
          setIsJoined(true);
        }

        setQuiz({
          ...quiz,
          questions: shuffle(quiz.questions),
        });
      } catch (error) {
        console.error(error);
      }
    })();
  }, [quizId, lobbyId]);

  const handleJoinLobby = () => {
    setIsLoading(true);
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: `/app/lobby/${lobbyId}/join`,
        body: userName,
      });
    } else {
      setIsLoading(false);
      console.error('WebSocket connection is not established.');
    }
  };

  const handleUserReady = (isReady: boolean) => {
    setIsLoading(true);
    if (!updateSelf({...memberData, currRound: isReady ? 0 : -1}, true)) {
      console.error('WebSocket connection is not established.');
    }
    setIsLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    ToastController.showSuccessToast(
      'Copied',
      'It is saved in your clipboard.',
    );
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  return (
    <PageContainer
      ref={backgroundRef}
      title={'Creating Lobby'}
      description={'Ready to find out who the bigger fan is?'}
      trailing={quiz?.isPrivate && <Chip type={ChipType.PRIVATE} />}>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <motion.div
          initial="visible"
          animate={!isJoined ? 'visible' : 'hidden'}
          transition={transition}
          variants={{
            hidden: {translateX: -ANIMATION_X_OFFSET},
            visible: {translateX: 0},
          }}>
          {quiz && (
            <div className="space-y-2 mb-4">
              <QuizPreview
                containerTitle="Selected Quiz"
                showScore={false}
                className="bg-neutral-900"
                quiz={quiz}
              />
            </div>
          )}
          <HoverContainer className="space-y-2 px-4">
            <div className="space-y-2 w-full -mt-1 mb-2">
              <Heading className="text-white" size={'3'}>
                Join the lobby
              </Heading>
              <Text className="text-white/60" size={'2'}>
                Enter your name and you're ready to go
              </Text>
            </div>
            <InputField
              autoFocus
              disabled={isLoading}
              maxLength={GAME_OPTIONS.MAX_SCORE_USERNAME_LENGTH}
              value={userName.toUpperCase()}
              onInput={handleInput}
              placeholder="Enter your name"
              className="flex flex-grow w-full"
            />
            <Button
              text="Join Lobby"
              ignoreMetaKey
              className="flex flex-grow w-full"
              textSize="2"
              onClick={handleJoinLobby}
              disabled={userName.trim().length < 3}
              loading={isLoading}
              type={ButtonType.outline}
            />
          </HoverContainer>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isJoined ? 'visible' : 'hidden'}
          transition={transition}
          variants={{
            hidden: {translateX: ANIMATION_X_OFFSET},
            visible: {translateX: 0},
          }}
          className="my-auto mx-[20%] absolute">
          {quiz && (
            <div className="space-y-2 mb-4">
              <QuizPreview
                containerTitle="Selected Quiz"
                showScore={false}
                className="bg-neutral-900"
                quiz={quiz}
              />
            </div>
          )}
          <HoverContainer className="space-y-2 px-4">
            <div className="space-y-2 w-full -mt-1 mb-2">
              <Heading className="text-white" size={'3'}>
                Challenge your friends
              </Heading>
              <Text className="text-white/60" size={'2'}>
                Send them the link. Or are you scared of some healthy
                competition?
              </Text>
            </div>
            <UrlContainer onClick={copyLink} />

            <div className="flex flex-col w-full py-2">
              {members.length > 0 && (
                <Text
                  weight={'medium'}
                  size={'2'}
                  className="text-white text-center">
                  Current Players
                </Text>
              )}
              <div className="flex flex-col space-y-2 mt-2 px-1">
                {members.map(m => {
                  const {sessionToken: token, currRound} = m;
                  const isDone = currRound === 0;
                  return (
                    <MemberTile
                      isSelf={token === sessionToken}
                      member={m}
                      key={token}
                      isDone={isDone}
                    />
                  );
                })}
              </div>
            </div>
            <Button
              text={isReady ? 'Not ready' : 'Are you ready?'}
              type={isReady ? ButtonType.outline : ButtonType.primary}
              className="flex flex-grow w-full"
              textSize="2"
              onClick={() => handleUserReady(!isReady)}
              disabled={userName.trim().length < 3}
              loading={isLoading}
            />
          </HoverContainer>
        </motion.div>
      </div>
    </PageContainer>
  );
}

function UrlContainer({onClick}: {onClick: () => void}): JSX.Element {
  return (
    <div
      onClick={onClick}
      className="w-full cursor-pointer bg-black/40 rounded-md py-2 px-3 flex items-center">
      <Text size="1" className="text-white/60 w-full">
        {window.location.href}
      </Text>
      <CopyIcon className="ml-4 text-white/90 size-5" />
    </div>
  );
}

export default LobbyScreen;
