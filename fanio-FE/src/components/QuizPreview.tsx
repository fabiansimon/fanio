import {Heading, Text} from '@radix-ui/themes';
import {Quiz} from '../types';
import {BarChartIcon} from '@radix-ui/react-icons';
import {useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';
import BackgroundLight from './BackgroundLight';
import useMouseEntered from '../hooks/useMouseEntered';
import {useMemo, useRef} from 'react';
import {UI} from '../utils/common';

interface QuizPreviewProps {
  quiz: Quiz;
  className?: string;
  containerTitle?: string;
  defaultNavigation?: boolean;
  onClick?: (id: string) => void;
  onClickScores?: (id: string) => void;
  invertColors?: boolean;
  showScore?: boolean;
}

function QuizPreview({
  containerTitle,
  quiz,
  defaultNavigation,
  className,
  onClick,
  onClickScores,
  showScore = true,
  invertColors = false,
}: QuizPreviewProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const mouseEntered = useMouseEntered(ref);

  const navigate = useNavigate();
  const {title, id, questions, totalPlays} = quiz;

  const {_onClick, _onClickScores} = useMemo(() => {
    return {
      _onClick: defaultNavigation
        ? () => navigate(`${ROUTES.playQuiz}/${id}`)
        : () => onClick?.(id),
      _onClickScores: defaultNavigation
        ? () => navigate(`${ROUTES.quizScores}/${id}`)
        : () => onClickScores?.(id),
    };
  }, [onClick, onClickScores, defaultNavigation, id, navigate]);

  const {textColor, subtitleColor, borderColor, backgroundColor} =
    useMemo(() => {
      return {
        textColor: invertColors ? 'text-black' : 'text-white',
        subtitleColor: invertColors ? 'text-slate-500' : 'text-white/80',
        borderColor: invertColors ? 'border-slate-200/60' : 'border-white/10',
        backgroundColor: invertColors ? 'bg-white' : 'transparent',
      };
    }, [invertColors]);

  return (
    <div className="flex w-full cursor-pointer">
      <BackgroundLight
        ref={ref}
        containerClassName="flex-grow"
        animate={!invertColors && mouseEntered}
        className={UI.cn(
          'flex flex-grow flex-col min-h-14 justify-center space-y-1 border px-2 py-1.5 rounded-lg',
          onClick !== null &&
            'hover:scale-[101%] transition-transform duration-150 ease-in-out cursor-pointer',
          borderColor,
          backgroundColor,
          className,
        )}
        onClick={_onClick}>
        {containerTitle && (
          <div className="border-b-[1.5px] border-b-neutral-700/40 pb-2 mb-2">
            <Heading className="text-white text-center" size={'3'}>
              {containerTitle}
            </Heading>
          </div>
        )}
        <Heading weight={'medium'} className={textColor} size={'2'}>
          {title}
        </Heading>
        <div className="flex flex-row justify-between w-full">
          <Text className={subtitleColor} size={'1'}>
            {`${questions.length} Questions`}
          </Text>
          <Text className={subtitleColor} size={'1'}>
            {/* {DateUtils.formatDate(createdAt, true)} */}
            {UI.formatNumber(totalPlays)}x times
          </Text>
        </div>
      </BackgroundLight>
      {showScore && (
        <div
          onClick={_onClickScores}
          className={UI.cn(
            'rounded-md border ml-1 cursor-pointer w-16 flex flex-col items-center align-middle justify-center',
            'hover:scale-[103%] transition-transform duration-150 ease-in-out cursor-pointer',
            backgroundColor,
            borderColor,
          )}>
          <BarChartIcon className={textColor} />
          <Text size={'1'} className={UI.cn('pt-1', subtitleColor)}>
            scores
          </Text>
        </div>
      )}
    </div>
  );
}

export default QuizPreview;
