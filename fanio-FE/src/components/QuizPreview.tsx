import {Heading, Text} from '@radix-ui/themes';
import {Quiz} from '../types';
import {BarChartIcon} from '@radix-ui/react-icons';
import {useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';
import BackgroundLight from './BackgroundLight';
import useMouseEntered from '../hooks/useMouseEntered';
import {useMemo, useRef} from 'react';
import {DateUtils, UI} from '../utils/common';

interface QuizPreviewProps {
  quiz: Quiz;
  className?: string;
  defaultNavigation?: boolean;
  onClick?: (id: string) => void;
  onClickScores?: (id: string) => void;
  invertColors?: boolean;
}

function QuizPreview({
  quiz,
  defaultNavigation,
  className,
  onClick,
  onClickScores,
  invertColors = false,
}: QuizPreviewProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const mouseEntered = useMouseEntered(ref);
  const navigate = useNavigate();
  const {title, description, id, questions, createdAt} = quiz;

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
        subtitleColor: invertColors ? 'text-slate-500' : 'text-white',
        borderColor: invertColors ? 'border-black/10' : 'border-white/30',
        backgroundColor: invertColors ? 'bg-white' : 'transparent',
      };
    }, [invertColors]);

  return (
    <BackgroundLight
      ref={ref}
      animate={!invertColors && mouseEntered}
      className={UI.cn(
        'flex w-full flex-col min-h-14 cursor-pointer justify-center space-y-1 border px-2 py-1.5 rounded-lg',
        borderColor,
        backgroundColor,
        className,
      )}
      onClick={_onClick}>
      <Heading weight={'medium'} className={textColor} size={'2'}>
        {title}
      </Heading>
      <div className="flex flex-row justify-between w-full">
        <Text className={subtitleColor} size={'1'}>
          {`${questions.length} Questions`}
        </Text>
        <Text className={subtitleColor} size={'1'}>
          {DateUtils.formatDate(createdAt, true)}
        </Text>
      </div>
      {/* <div>
          <BarChartIcon className="text-white" />
          <Text size={'1'} className="text-white">
            scores
          </Text>
        </div> */}
    </BackgroundLight>
  );
}

export default QuizPreview;
