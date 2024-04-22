import {CredentialResponse, GoogleLogin} from '@react-oauth/google';
import HoverContainer from './HoverContainer';
import {useState} from 'react';
import {useUserDataContext} from '../providers/UserDataProvider';
import ToastController from '../controllers/ToastController';
import {authUser} from '../utils/api';

function AuthPopUp(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {updateUserData} = useUserDataContext();

  const onError = () => {
    return ToastController.showErrorToast('Oh no...', 'Something went wrong.');
  };

  const onSuccess = async (res: CredentialResponse) => {
    setIsLoading(true);
    if (!res.credential) {
      return onError();
    }

    try {
      const jwt = await authUser({token: res.credential});
    } catch (error) {
      console.error(error);
      onError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-0 blur(14px) left-0 right-0 bottom-0 backdrop-blur-md flex w-full h-full z-10 items-center justify-center flex-col">
      <HoverContainer
        title="Sign up"
        description="This will only take a second">
        <div className="mt-3">
          <GoogleLogin
            onError={onError}
            onSuccess={onSuccess}
            type="standard"
          />
        </div>
      </HoverContainer>
    </div>
  );
}

export default AuthPopUp;
