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
import {useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';
import {setJwtToken} from '../utils/api';
import ToastController from '../controllers/ToastController';

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

  const logoutUser = useCallback(
    (forceful?: boolean) => {
      if (forceful) {
        ToastController.showErrorToast(
          'Invalid credentials',
          'You were logged out.',
        );
      } else {
        ToastController.showSuccessToast(
          'Logged out',
          'We hope you come back soon.',
        );
      }

      setAuthModalVisible(false);
      navigate(ROUTES.home);
      setUserData(undefined);
      LocalStorage.clearUserData();
      LocalStorage.clearJwtToken();
    },
    [navigate],
  );

  useEffect(() => {
    const jwt = LocalStorage.fetchJwtToken();
    const user = LocalStorage.fetchUserData();
    if (!user || !jwt) {
      LocalStorage.clearJwtToken();
      LocalStorage.clearUserData();
      return;
    }

    setJwtToken(jwt);
    updateUserData(user);
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
    throw new Error('useUserDataContext must be used within a LobbyProvider');

  return context;
}

export default UserDataProvider;
