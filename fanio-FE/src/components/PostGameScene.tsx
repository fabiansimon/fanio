import {useMemo, useState} from 'react';
import {motion} from 'framer-motion';
import {ButtonType, LocalScore, Score} from '../types';
import {uploadScore} from '../utils/api';
import {LocalStorage} from '../utils/localStorage';
import {GAME_OPTIONS} from '../constants/Game';
import {rateScore} from '../utils/logic';
import {Heading, Text} from '@radix-ui/themes';
import ScoreTile from './ScoreTile';
import {CheckIcon} from '@radix-ui/react-icons';
import InputField from './InputField';
import Button from './Button';

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
  onRestart: () => void;
}): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [attempt, setAttempt] = useState<LocalScore & {userName: string}>({
    ...lastAttempt,
    userName: '',
  });

  const uploadGameScore = async () => {
    setIsLoading(true);
    try {
      const {totalScore, timeElapsed, userName} = attempt;
      const {id: scoreId} = await uploadScore({
        totalScore,
        timeElapsed,
        userName,
        quizId,
      });
      LocalStorage.saveScoreId(scoreId);
      setIsUploaded(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

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
      <div>
        <Heading size={'8'} className="text-white -rotate-3 pb-3">
          {title}
        </Heading>
        <Text size={'4'} className="text-white/60">
          {subtitle}
        </Text>
      </div>
      <div className="border border-white/20 overflow-hidden rounded-lg py-3 px-3">
        <ScoreTile
          score={attempt.userName ? attempt : lastAttempt}
          position={3}
        />
        <div className="relative">
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
            className="flex space-x-2 h-11 mt-4">
            <InputField
              disabled={isLoading}
              maxLength={GAME_OPTIONS.MAX_SCORE_USERNAME_LENGTH}
              value={attempt.userName}
              onInput={handleInput}
              placeholder="Enter your name"
              className="flex"
            />
            <Button
              type={ButtonType.outline}
              text="Upload Score"
              textSize="2"
              loading={isLoading}
              onClick={uploadGameScore}
              className="flex w-1/2"
              disabled={attempt.userName.trim().length === 0}
            />
          </motion.div>
        </div>
      </div>
      <Button
        text="Try again"
        className="mx-auto mt-4"
        hotkey="R"
        onClick={onRestart}
      />
    </div>
  );
}

export default PostGameScene;
