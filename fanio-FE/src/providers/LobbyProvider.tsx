import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {useStompClient} from 'react-stomp-hooks';
import {LobbyData, LobbyMember, Quiz} from '../types';
import {INIT_LOBBY_DATA, INIT_USER_DATA} from '../constants/Init';
import {LocalStorage} from '../utils/localStorage';

interface LobbyContextType {
  lobbyData: LobbyData;
  userData: UserData;
  setLobbyId: (lobbyId: string) => void;
  setMembers: (members: LobbyMember[]) => void;
  setSessionToken: (token: string) => void;
  setQuiz: (quiz: Quiz) => void;
  setQuizId: (quizId: string) => void;
  setUserName: (userName: string) => void;
  setUserData: (userData: UserData) => void;
  exitLobby: () => void;
  createLobby: (quizId: string) => boolean;
  updateSelf: (self: LobbyMember, sendData: boolean) => boolean;
}

interface UserData {
  memberData: LobbyMember;
  userName: string;
  sessionToken: string;
}

const LobbyContext = createContext<LobbyContextType | undefined>(undefined);

function LobbyProvider({children}: {children: React.ReactNode}) {
  const [lobbyData, _setLobbyData] = useState<LobbyData>(INIT_LOBBY_DATA);
  const [userData, _setUserData] = useState<UserData>(INIT_USER_DATA);

  const stompClient = useStompClient();
  const healthyClient = useMemo(
    () => stompClient && stompClient.connected,
    [stompClient],
  );

  const setLobbyId = useCallback((lobbyId: string) => {
    _setLobbyData(prev => ({...prev, lobbyId}));
  }, []);

  const setQuizId = useCallback((quizId: string) => {
    _setLobbyData(prev => ({...prev, quizId: quizId}));
  }, []);

  const setQuiz = useCallback((quiz: Quiz) => {
    _setLobbyData(prev => ({...prev, quiz}));
  }, []);

  const setMembers = useCallback((members: LobbyMember[]) => {
    _setLobbyData(prev => ({...prev, members}));
  }, []);

  const setSessionToken = useCallback((token: string) => {
    _setUserData(prev => ({...prev, sessionToken: token}));
    LocalStorage.saveSessionToken(token);
  }, []);

  const setUserName = useCallback((userName: string) => {
    _setUserData(prev => ({...prev, userName}));
  }, []);

  const setUserData = useCallback((userData: UserData) => {
    _setUserData(userData);
  }, []);

  const exitLobby = useCallback(() => {
    if (stompClient && lobbyData.lobbyId && userData?.sessionToken) {
      stompClient.publish({
        destination: `/app/lobby/${lobbyData.lobbyId}/exit`,
        body: JSON.stringify(userData.sessionToken),
      });
    }
  }, [stompClient, lobbyData.lobbyId, userData]);

  const createLobby = useCallback(
    (quizId: string): boolean => {
      if (!healthyClient) return false;
      stompClient!.publish({
        destination: '/app/lobby/create',
        body: JSON.stringify(quizId),
      });
      return true;
    },
    [stompClient, healthyClient],
  );

  const updateSelf = useCallback(
    (self: LobbyMember, sendData: boolean): boolean => {
      console.log('called');
      _setUserData(prev => {
        return {
          ...prev,
          memberData: self,
        };
      });

      if (!sendData) return false;
      if (!healthyClient) return false;

      stompClient!.publish({
        destination: `/app/lobby/${lobbyData.lobbyId}/update-member`,
        body: JSON.stringify(self),
      });
      return true;
    },
    [stompClient, healthyClient, lobbyData.lobbyId],
  );

  useEffect(() => {
    if (!userData || userData.sessionToken || !lobbyData.members) return;
    const self = lobbyData.members.find(
      m => m.userName === userData.userName.toUpperCase(),
    );
    if (self) {
      const {sessionToken} = self;
      setSessionToken(sessionToken);
      _setUserData(prev => {
        return {
          ...prev,
          sessionToken: sessionToken,
          memberData: self,
        };
      });
    }
  }, [userData, lobbyData.members, setSessionToken]);

  const data = {
    lobbyData,
    userData,
    setLobbyId,
    setMembers,
    setSessionToken,
    setQuiz,
    setQuizId,
    setUserName,
    setUserData,
    exitLobby,
    createLobby,
    updateSelf,
  };

  return <LobbyContext.Provider value={data}>{children}</LobbyContext.Provider>;
}

export function useLobbyContext() {
  const context = useContext(LobbyContext);
  if (!context) {
    throw new Error('useLobbyContext must be used within a LobbyProvider');
  }
  return context;
}

export default LobbyProvider;
