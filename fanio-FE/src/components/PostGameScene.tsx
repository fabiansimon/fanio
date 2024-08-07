import {useEffect, useMemo, useState} from 'react';
import {motion} from 'framer-motion';
import {
  AchievementType,
  ButtonType,
  LocalScore,
  Score,
  UserData,
} from '../types';
import {fetchScorePlacement, uploadScore} from '../utils/api';
import {LocalStorage} from '../utils/localStorage';
import {GAME_OPTIONS} from '../constants/Game';
import {rateScore} from '../utils/logic';
import {Heading, Text} from '@radix-ui/themes';
import ScoreTile from './ScoreTile';
import {CheckIcon, PersonIcon} from '@radix-ui/react-icons';
import InputField from './InputField';
import Button from './Button';
import {useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';
import HoverContainer from './HoverContainer';
import {UI} from '../utils/common';
import {useUserDataContext} from '../providers/UserDataProvider';

const ANIMATION_DURATION = 0.15; // in secon
const transition = {
  duration: ANIMATION_DURATION,
  type: 'spring',
  mass: 0.05,
};

function PostGameScene({
  topScore,
  lastAttempt,
  onRestart,
  quizId,
}: {
  topScore?: Score;
  lastAttempt: LocalScore;
  quizId: string;
  userData?: UserData;
  onRestart: () => void;
}): JSX.Element {
  const {userData, openAuthModal, isAuth} = useUserDataContext();

  const formattedName = useMemo(() => {
    if (!userData) return 'Last Attempt';
    return UI.cn(userData.firstName, userData.lastName);
  }, [userData]);

  useEffect(() => {
    setAttempt(prev => ({...prev, userName: formattedName}));
  }, [formattedName]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [placement, setPlacement] = useState<number | undefined>();
  const [attempt, setAttempt] = useState<LocalScore & {userName: string}>({
    ...lastAttempt,
    userName: formattedName,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!lastAttempt) return;
    (async () => {
      try {
        const {quizId, totalScore: score} = lastAttempt;
        const res = await fetchScorePlacement({
          quizId,
          score,
        });
        setPlacement(res);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [lastAttempt]);

  const uploadGameScore = async () => {
    if (isUploaded || !userData) return;
    setIsLoading(true);
    try {
      const {totalScore, timeElapsed, userName} = attempt;
      const {id: scoreId} = await uploadScore({
        score: {
          totalScore,
          timeElapsed,
          userName: userName || formattedName,
          quizId,
        },
        userId: userData.id,
      });
      LocalStorage.saveScoreId(scoreId);
      setIsUploaded(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const achievement = useMemo(() => {
    if (!placement) return;
    let a;
    if (placement < 4) {
      a = [
        AchievementType.FIRST,
        AchievementType.SECOND,
        AchievementType.THIRD,
      ][placement - 1];
    }

    return a;
  }, [placement]);

  const {title, subtitle} = useMemo(() => {
    const {POST_GAME_SUBTITLES, POST_GAME_TITLES} = GAME_OPTIONS;
    if (!topScore)
      return {
        title: POST_GAME_TITLES[0],
        subtitle: POST_GAME_SUBTITLES[0],
      };

    const {totalScore: _currScore} = lastAttempt;
    const {totalScore: _topScore} = topScore;

    const rating = rateScore(_currScore, _topScore);
    return {
      title: POST_GAME_TITLES[rating],
      subtitle: POST_GAME_SUBTITLES[rating],
    };
  }, [lastAttempt, topScore]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttempt(prev => {
      return {
        ...prev,
        userName: e.target.value,
      };
    });
  };

  return (
    <div className="mx-[10%] my-auto space-y-3">
      <div className="flex flex-col justify-center">
        <Heading size={'6'} className="text-white text-center -rotate-2">
          {title}
        </Heading>
        <Text size={'4'} className="text-white/60 text-center">
          {subtitle}
        </Text>
      </div>
      <HoverContainer className="items-center overflow-hiddenf flex justify-between px-3 py-4 overflow-hidden">
        <ScoreTile
          achievement={achievement}
          score={{...attempt, userName: attempt.userName || formattedName}}
          position={placement}
        />
        {isAuth ? (
          <div className="relative w-full mt-4 -mb-1 bottom-0">
            <motion.div
              animate={!isUploaded ? 'hidden' : 'shown'}
              variants={{shown: {x: 0}, hidden: {x: -1000}}}
              transition={transition}
              className="absolute flex bg-green-400/30 rounded-xl h-11 w-full items-center justify-center space-x-2">
              <CheckIcon className="text-green-300 size-5" />
              <Text size={'2'} weight={'medium'} className="text-green-300">
                Successfully uploaded
              </Text>
            </motion.div>
            <motion.div
              transition={transition}
              variants={{shown: {x: 0}, hidden: {x: 1000}}}
              animate={isUploaded ? 'hidden' : 'shown'}
              className="flex w-full flex-grow space-x-0 space-y-2 flex-col md:flex-row md:space-x-2 md:space-y-0">
              <InputField
                disabled={isLoading}
                maxLength={GAME_OPTIONS.MAX_SCORE_USERNAME_LENGTH}
                value={attempt.userName}
                onInput={handleInput}
                placeholder="Enter your name"
                className="flex flex-grow w-full"
              />
              <Button
                type={ButtonType.outline}
                text="Upload Score"
                textSize="2"
                hotkey={!isUploaded && 'Enter'}
                ignoreMetaKey
                loading={isLoading}
                onClick={uploadGameScore}
                className="flex flex-grow w-full"
              />
            </motion.div>
          </div>
        ) : (
          <Button
            type={ButtonType.secondary}
            textSize="2"
            onClick={openAuthModal}
            className="flex-grow w-full mt-4 -mb-2"
            icon={<PersonIcon className="text-white" />}
            text="Log in to upload your score."
          />
        )}
      </HoverContainer>
      <div className="flex w-full justify-between space-x-2">
        <Button
          text="See Leaderboard"
          type={ButtonType.outline}
          textSize="2"
          className="flex-grow w-full"
          onClick={() => navigate(`${ROUTES.quizScores}/${quizId}`)}
        />
        <Button
          textSize="2"
          text="Try again"
          className="flex-grow w-full"
          ignoreMetaKey
          hotkey={isUploaded && 'Enter'}
          onClick={onRestart}
        />
      </div>
    </div>
  );
}

export default PostGameScene;
