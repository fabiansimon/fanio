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
  data,
  className,
  invertColors = false,
  showPlacement,
  showScore,
}: QuizListProps): JSX.Element {
  return (
    <div
      className={UI.cn(
        'flex flex-grow h-full space-y-2 pt-3 flex-col',
        className,
      )}>
      {data.map((quiz, index) => {
        return (
          <div key={quiz.id} className="flex space-x-2">
            {showPlacement && (
              <PlaceContainer position={index + 1} className="-mr-3" />
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
