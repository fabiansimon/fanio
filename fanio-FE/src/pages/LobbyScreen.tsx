import {useBeforeUnload, useParams} from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import {useEffect, useRef, useState} from 'react';
import {ChipType, Quiz, Score} from '../types';
import {fetchPlayableQuizById} from '../utils/api';
import {shuffle} from 'lodash';
import {Heading, Text} from '@radix-ui/themes';
import Chip from '../components/Chip';
import HoverContainer from '../components/HoverContainer';
import {useStompClient, useSubscription} from 'react-stomp-hooks';
import ToastController from '../providers/ToastController';
import Loading from '../components/Loading';
import {CopyIcon} from '@radix-ui/react-icons';
import Button from '../components/Button';
import {randomNumber} from '../utils/logic';

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

function LobbyScreen(): JSX.Element {
  const [topScore, setTopScore] = useState<Score | null>(null);
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [members, setMembers] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {quizId, lobbyId} = useParams();

  const stompClient = useStompClient();

  useBeforeUnload(() => {
    if (stompClient)
      stompClient.publish({
        destination: `/app/lobby/${lobbyId}/exit`,
        body: userName,
      });
  });
  useSubscription(`/topic/lobby/${lobbyId}/members`, message => {
    setMembers(JSON.parse(message.body));
  });

  useEffect(() => {
    setUserName(NICKNAMES[randomNumber({max: NICKNAMES.length - 1})]);
  }, []);

  useEffect(() => {
    if (stompClient && stompClient.connected && userName) {
      stompClient.publish({
        destination: `/app/lobby/${lobbyId}/join`,
        body: userName,
      });
      console.log(`Request sent to join lobby ${lobbyId}`);
    } else {
      console.error('WebSocket connection is not established.');
    }
  }, [lobbyId, stompClient, userName]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    ToastController.showSuccessToast(
      'Copied',
      'It is saved in your clipboard.',
    );
  };

  const backgroundRef = useRef<any>(null);

  useEffect(() => {
    if (!quizId) return;
    (async () => {
      try {
        const {quiz, topScore} = await fetchPlayableQuizById({id: quizId});
        setQuizData({
          ...quiz,
          questions: shuffle(quiz.questions),
        });
        setTopScore(topScore);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [quizId]);

  return (
    <PageContainer
      ref={backgroundRef}
      title={quizData?.title}
      description={quizData?.description}
      trailing={quizData?.isPrivate && <Chip type={ChipType.PRIVATE} />}>
      <div className="w-full h-full flex flex-col">
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
                <Text size="1" className="text-white/60 w-full">
                  {window.location.href}
                </Text>
                <CopyIcon className="text-white/90 size-5" />
              </>
            )}
          </div>
          {members.map((m, i) => (
            <Text key={i} className="text-white">
              {m}
            </Text>
          ))}
          <Button
            hotkey="Enter"
            ignoreMetaKey
            // onClick={handleConnectToLobby}
            text="Start Quiz"
            className="flex flex-grow w-full"
            textSize="2"
          />
        </HoverContainer>
      </div>
    </PageContainer>
  );
}

export default LobbyScreen;
