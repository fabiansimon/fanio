import {createContext, useCallback, useContext, useMemo, useState} from 'react';

interface UserData {
  email: string;
  googleId: string;
}

interface UserDataContextType {
  userData: UserData | undefined;
  isAuth: boolean;
  updateUserData: (userData: UserData) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined,
);

function UserDataProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [userData, setUserData] = useState<UserData | undefined>();

  const updateUserData = useCallback((userData: UserData) => {
    setUserData(userData);
  }, []);

  const isAuth = useMemo(() => {
    return !!userData;
  }, [userData]);

  const value = {
    userData,
    isAuth,
    updateUserData,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserDataContext() {
  const context = useContext(UserDataContext);
  if (!context)
    throw new Error('useLobbyContext must be used within a LobbyProvider');

  return context;
}

export default UserDataProvider;
