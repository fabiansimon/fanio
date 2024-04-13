import {useBeforeUnload, useParams} from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import {useEffect, useRef, useState} from 'react';
import {ButtonType, ChipType, LobbyMember, Quiz, Score} from '../types';
import {motion} from 'framer-motion';
import {fetchPlayableQuizById} from '../utils/api';
import {shuffle} from 'lodash';
import {Heading, Text} from '@radix-ui/themes';
import Chip from '../components/Chip';
import HoverContainer from '../components/HoverContainer';
import {useStompClient, useSubscription} from 'react-stomp-hooks';
import ToastController from '../controllers/ToastController';
import Loading from '../components/Loading';
import {CheckIcon, CopyIcon} from '@radix-ui/react-icons';
import Button from '../components/Button';
import {randomNumber} from '../utils/logic';
import MemberTile from '../components/MemberTile';
import {GAME_OPTIONS} from '../constants/Game';
import InputField from '../components/InputField';
import QuizPreview from '../components/QuizPreview';

const ANIMATION_DURATION = 200;

const transition = {
  duration: ANIMATION_DURATION,
  type: 'spring',
  mass: 0.05,
};

const NICKNAMES = [
  'Fabian',
  'Didi',
  'Julia',
  'Clemens',
  'René',
  'Verena',
  'Hayden',
  'Alex',
];

const MOCK_MEMBERS: LobbyMember[] = [
  {
    currRound: -1,
    sessionToken: '3u12938213',
    timeElapsed: 0.0,
    totalScore: 0.0,
    userName: 'Fabian',
  },
  {
    currRound: -1,
    sessionToken: '3u12938213',
    timeElapsed: 0.0,
    totalScore: 0.0,
    userName: 'Didi',
  },
  {
    currRound: -1,
    sessionToken: '3u12938213',
    timeElapsed: 0.0,
    totalScore: 0.0,
    userName: 'Julia',
  },
];

function LobbyScreen(): JSX.Element {
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [members, setMembers] = useState<LobbyMember[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string | undefined>();

  const {quizId, lobbyId} = useParams();

  const backgroundRef = useRef<any>(null);
  const stompClient = useStompClient();

  useBeforeUnload(() => {
    if (stompClient)
      stompClient.publish({
        destination: `/app/lobby/${lobbyId}/exit`,
        body: userName,
      });
  });

  useSubscription(`/topic/lobby/${lobbyId}/members`, message => {
    if (isLoading) {
      setIsLoading(false);
      setIsJoined(true);
    }
    setMembers(JSON.parse(message.body));
  });

  useEffect(() => {
    if (sessionToken) return;
    console.log(members);
  }, [members, sessionToken]);

  useEffect(() => {
    if (!quizId) return;
    (async () => {
      try {
        const {quiz} = await fetchPlayableQuizById({id: quizId});
        setQuizData({
          ...quiz,
          questions: shuffle(quiz.questions),
        });
      } catch (error) {
        console.error(error);
      }
    })();
  }, [quizId]);

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

  const handleUserReady = () => {
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
      trailing={quizData?.isPrivate && <Chip type={ChipType.PRIVATE} />}>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <motion.div
          initial="visible"
          animate={!isJoined ? 'visible' : 'hidden'}
          variants={{
            hidden: {translateX: -1000},
            visible: {translateX: 0},
          }}>
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
              value={userName}
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
          variants={{
            hidden: {translateX: 1000},
            visible: {translateX: 0},
          }}
          className="my-auto mx-[20%] absolute">
          {quizData && (
            <div className="space-y-2 mb-4">
              <QuizPreview
                containerTitle="Selected Quiz"
                showScore={false}
                className=""
                quiz={quizData}
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
                  const {sessionToken, currRound} = m;
                  const isDone = currRound === 0;
                  return (
                    <MemberTile member={m} key={sessionToken} isDone={isDone} />
                  );
                })}
              </div>
            </div>
            <Button
              text="Are you ready?"
              className="flex flex-grow w-full"
              textSize="2"
              onClick={handleUserReady}
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
