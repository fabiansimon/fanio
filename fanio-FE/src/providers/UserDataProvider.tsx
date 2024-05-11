import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AuthPopUp from '../components/AuthPopUp';
import {UserData} from '../types';
import {LocalStorage} from '../utils/localStorage';
import {useNavigate, useNavigation} from 'react-router-dom';
import ROUTES from '../constants/Routes';

interface UserDataContextType {
  userData: UserData | undefined;
  isAuth: boolean;
  updateUserData: (userData: UserData) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  logoutUser: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined,
);

function UserDataProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [authModalVisible, setAuthModalVisible] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | undefined>();

  const navigate = useNavigate();

  const openAuthModal = () => setAuthModalVisible(true);
  const closeAuthModal = () => setAuthModalVisible(false);

  const updateUserData = useCallback((userData: UserData) => {
    LocalStorage.saveUserData(userData);
    setUserData(userData);
  }, []);

  const logoutUser = useCallback(() => {
    navigate(ROUTES.home);
    LocalStorage.clearUserData();
    setUserData(undefined);
  }, [navigate]);

  useEffect(() => {
    const user = LocalStorage.fetchUserData();
    if (user) updateUserData(user);
  }, [updateUserData]);

  const isAuth = useMemo(() => {
    return !!userData;
  }, [userData]);

  const value = {
    userData,
    isAuth,
    updateUserData,
    openAuthModal,
    closeAuthModal,
    logoutUser,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
      {authModalVisible && !userData && <AuthPopUp />}
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
