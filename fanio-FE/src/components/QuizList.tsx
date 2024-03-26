import {Quiz} from '../types';
import {UI} from '../utils/common';
import QuizPreview from './QuizPreview';

interface QuizListProps {
  data: Quiz[];
  className?: string;
  invertColors?: boolean;
}

function QuizList({
  data,
  className,
  invertColors = false,
}: QuizListProps): JSX.Element {
  return (
    <div className={UI.cn('flex space-y-2 pt-3 flex-col h-full', className)}>
      {data.map((quiz, index) => {
        return (
          <div className="flex space-x-2">
            <QuizPreview
              invertColors={invertColors}
              key={index}
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
