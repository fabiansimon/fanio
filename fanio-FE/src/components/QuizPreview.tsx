import {Text} from '@radix-ui/themes';
import {Quiz} from '../types';
import {useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';
import BackgroundLight from './BackgroundLight';
import useMouseEntered from '../hooks/useMouseEntered';
import {useRef} from 'react';

function QuizPreview({
  quiz,
  defaultNavigation,
  onClick,
  onClickScores,
}: {
  quiz: Quiz;
  defaultNavigation?: boolean;
  onClick?: (id: string) => void;
  onClickScores?: (id: string) => void;
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const mouseEntered = useMouseEntered(ref);
  const navigate = useNavigate();
  const {title, description, id} = quiz;

  return (
    <BackgroundLight
      active={mouseEntered}
      className="flex cursor-pointer bg-slate-900 rounded-[5px]">
      <div
        ref={ref}
        onClick={() =>
          defaultNavigation
            ? navigate(`${ROUTES.playQuiz}/${id}`)
            : onClick?.(id)
        }
        className="flex w-full py-2 px-2 justify-between items-start">
        <div className="flex flex-col">
          <div className="flex">
            <Text size="2" weight="medium" className="text-white">
              {title}
            </Text>
          </div>
          <Text size="2" className="text-slate-400">
            {description}
          </Text>
        </div>
      </div>
      <div
        onClick={() =>
          defaultNavigation
            ? navigate(`${ROUTES.quizScores}/${id}`)
            : onClickScores?.(id)
        }
        className="flex items-center ml-2 text-center border-l px-2">
        <Text size="1" weight="medium" className="text-white">
          see scores
        </Text>
      </div>
    </BackgroundLight>
  );
}

export default QuizPreview;
