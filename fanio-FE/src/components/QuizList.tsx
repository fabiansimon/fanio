import {Quiz} from '../types';
import {UI} from '../utils/common';
import PlaceContainer from './PlaceContainer';
import QuizPreview from './QuizPreview';

interface QuizListProps {
  data: Quiz[];
  className?: string;
  invertColors?: boolean;
  showPlacement?: boolean;
  showScore?: boolean;
}

function QuizList({
  className,
  data,
  invertColors = false,
  showScore,
  showPlacement,
}: QuizListProps): JSX.Element {
  return (
    <div className={UI.cn('space-y-2 overflow-y-auto px-2 -mx-2', className)}>
      {data.map((quiz, index) => {
        return (
          <div className="flex" key={index}>
            {showPlacement && (
              <PlaceContainer position={index + 1} className="-mr-2" />
            )}
            <QuizPreview
              showScore={showScore}
              invertColors={invertColors}
              quiz={quiz}
              defaultNavigation
            />
          </div>
        );
      })}
    </div>
  );
}

export default QuizList;
