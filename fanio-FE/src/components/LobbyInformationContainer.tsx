import {useSubscription} from 'react-stomp-hooks';
import {useLobbyContext} from '../providers/LobbyProvider';
import MemberTile from './MemberTile';
import {useMemo} from 'react';

function LobbyInformationContainer({
  lobbyId,
  round,
  onFinishRound,
}: {
  lobbyId: string;
  round: number;
  onFinishRound: () => void;
}): JSX.Element {
  const {
    setMembers,
    userData: {sessionToken},
    lobbyData: {members},
  } = useLobbyContext();

  useSubscription(`/topic/lobby/${lobbyId}/members`, message => {
    setMembers(JSON.parse(message.body));
  });

  useSubscription(`/topic/lobby/${lobbyId}/data`, message => {
    console.log(message.body);
    onFinishRound();
  });

  const sortedMembers = useMemo(() => {
    return members.sort((a, b) => b.totalScore - a.totalScore);
  }, [members]);

  return (
    <div>
      {sortedMembers.map((m, i) => {
        const {sessionToken: token, currRound} = m;
        const isDone = currRound > round;

        return (
          <MemberTile
            showPoints
            position={i + 1}
            isSelf={token === sessionToken}
            member={m}
            key={token}
            isDone={isDone}
          />
        );
      })}
    </div>
  );
}

export default LobbyInformationContainer;
