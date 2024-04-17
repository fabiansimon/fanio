import {CredentialResponse, GoogleLogin} from '@react-oauth/google';
import HoverContainer from './HoverContainer';
import {useState} from 'react';
import {useUserDataContext} from '../providers/UserDataProvider';

function AuthPopUp(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {updateUserData} = useUserDataContext();

  const onSuccess = (res: CredentialResponse) => {
    console.log(res);
  };

  return (
    <div className="fixed top-0 blur(14px) left-0 right-0 bottom-0 backdrop-blur-md flex w-full h-full z-10 items-center justify-center flex-col">
      <HoverContainer
        title="Sign up"
        description="This will only take a second">
        <div className="mt-3">
          <GoogleLogin onSuccess={onSuccess} type="standard" />
        </div>
      </HoverContainer>
    </div>
  );
}

export default AuthPopUp;
