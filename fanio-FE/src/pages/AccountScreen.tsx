import {Heading, Text} from '@radix-ui/themes';
import Avatar from '../components/Avatar';
import PageContainer from '../components/PageContainer';
import {DateUtils, UI} from '../utils/common';
import {useUserDataContext} from '../providers/UserDataProvider';
import {ButtonType, Score, UserData} from '../types';
import HoverContainer from '../components/HoverContainer';
import Button from '../components/Button';
import {useEffect, useState} from 'react';
import {fetchScoresFromUser} from '../utils/api';
import ToastController from '../controllers/ToastController';
import PlaceContainer from '../components/PlaceContainer';
import Hoverable from '../components/Hoverable';
import QuizLink from '../components/QuizLink';

function AccountScreen(): JSX.Element {
  const {userData, isAuth, openAuthModal, logoutUser} = useUserDataContext();

  return (
    <PageContainer title="Your Account">
      {isAuth ? (
        <>
          <ProfileSummary user={userData!} className="mt-8" />
          <ScoreSummary userId={userData?.id!} className="mt-4" />
          <Button
            type={ButtonType.outline}
            text="Sign Out"
            onClick={() => logoutUser()}
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

function ScoreSummary({
  className,
  userId,
}: {
  className?: string;
  userId: string;
}) {
  const [topScores, setTopScores] = useState<Score[] | undefined>();

  useEffect(() => {
    (async () => {
      try {
        const {content} = await fetchScoresFromUser({userId});
        setTopScores(content);
      } catch (error) {
        console.warn(error);
        ToastController.showErrorToast(
          'Oh no...',
          'Something went wrong when fetching your top scores, try again later',
        );
      }
    })();
  }, [userId]);

  if (!topScores || !topScores.length) return <div />;

  return (
    <HoverContainer className={UI.cn('items-start', className)}>
      <Heading size={'4'} className="text-white text-left">
        Top Scores
      </Heading>
      <div className="space-y-4 mt-4">
        {topScores?.map(({id, timeElapsed, totalScore, quizId}, index) => {
          return (
            <Hoverable key={id} hoverContent={<QuizLink quizId={quizId} />}>
              <div className="flex">
                <PlaceContainer position={index + 1} />
                <div className="flex flex-col">
                  <Text size={'2'} className="text-white">
                    {UI.formatPoints(totalScore)}
                  </Text>
                  <Text size={'2'} className="text-white/40">
                    {DateUtils.formatTime(timeElapsed, 'sec')}
                  </Text>
                </div>
              </div>
            </Hoverable>
          );
        })}
      </div>
    </HoverContainer>
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
