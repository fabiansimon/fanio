import {Heading, Text} from '@radix-ui/themes';
import Avatar from '../components/Avatar';
import PageContainer from '../components/PageContainer';
import {UI} from '../utils/common';
import {useUserDataContext} from '../providers/UserDataProvider';
import {ButtonType, UserData} from '../types';
import HoverContainer from '../components/HoverContainer';
import Button from '../components/Button';

function AccountScreen(): JSX.Element {
  const {userData, isAuth, openAuthModal, logoutUser} = useUserDataContext();

  return (
    <PageContainer title="Your Account">
      {isAuth ? (
        <>
          <ProfileSummary user={userData!} className="mt-8" />
          <Button
            type={ButtonType.outline}
            text="Sign Out"
            onClick={logoutUser}
            textSize="2"
            className="mx-auto mt-4"
          />
        </>
      ) : (
        <Button
          type={ButtonType.outline}
          onClick={openAuthModal}
          text="Sign In"
          textSize="2"
          className="mx-auto mt-4"
        />
      )}
    </PageContainer>
  );
}

function ProfileSummary({
  className,
  user,
}: {
  className?: string;
  user: UserData;
}): JSX.Element {
  const {lastName, firstName, email} = user;
  return (
    <HoverContainer className={UI.cn('space-y-[0.5px]', className)}>
      <Avatar user={user} className="mb-3" />
      <Heading
        size={'4'}
        className="text-white">{`${firstName} ${lastName}`}</Heading>
      <Text size={'2'} className="text-white/40">
        {email}
      </Text>
    </HoverContainer>
  );
}

export default AccountScreen;
