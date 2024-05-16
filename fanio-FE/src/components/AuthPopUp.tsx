import {CredentialResponse, GoogleLogin} from '@react-oauth/google';
import HoverContainer from './HoverContainer';
import {useState} from 'react';
import {useUserDataContext} from '../providers/UserDataProvider';
import ToastController from '../controllers/ToastController';
import {authUser} from '../utils/api';
import {Cross1Icon} from '@radix-ui/react-icons';
import {Text} from '@radix-ui/themes';
import Loading from './Loading';

function AuthPopUp(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {updateUserData, closeAuthModal} = useUserDataContext();

  const onError = () => {
    setIsLoading(false);
    return ToastController.showErrorToast('Oh no...', 'Something went wrong.');
  };

  const onSuccess = async (res: CredentialResponse) => {
    setIsLoading(true);
    if (!res.credential) {
      return onError();
    }

    try {
      const user = await authUser({token: res.credential});
      updateUserData(user);
    } catch (error) {
      console.error(error);
      onError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-0 blur(14px) left-0 right-0 bottom-0 backdrop-blur-md flex w-full h-full z-10 items-center justify-center flex-col">
      <div>
        <div
          onClick={closeAuthModal}
          className="flex items-center space-x-2 mb-2 cursor-pointer">
          <Cross1Icon className="text-white" />
          <Text className="text-white">Close</Text>
        </div>
        <HoverContainer
          title="Sign up"
          description="This will only take a second">
          <div className="mt-3 h-10 items-center flex">
            {isLoading ? (
              <Loading className="size-7" />
            ) : (
              <GoogleLogin
                onError={onError}
                onSuccess={onSuccess}
                type="standard"
              />
            )}
          </div>
        </HoverContainer>
      </div>
    </div>
  );
}

export default AuthPopUp;
