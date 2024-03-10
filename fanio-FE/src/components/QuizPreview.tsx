import {Text} from '@radix-ui/themes';
import {Quiz} from '../types';
import {DateUtils} from '../utils/common';

function QuizPreview({
  quiz,
  onClick,
  onClickScores,
}: {
  quiz: Quiz;
  onClick?: (id: string) => void;
  onClickScores?: (id: string) => void;
}): JSX.Element {
  const {title, description, createdAt, questions, id} = quiz;
  return (
    <div className="flex">
      <div
        onClick={() => onClick?.(id)}
        className="flex w-full p-2 rounded-md cursor-pointer bg-white justify-between">
        <div className="flex flex-col">
          <Text>{title}</Text>
          <Text>{description}</Text>
        </div>
        <div className="flex text-right flex-col">
          <Text>{`${questions.length} questions`}</Text>
          <Text>{DateUtils.formatDate(createdAt)}</Text>
        </div>
      </div>
      <div
        onClick={() => onClickScores?.(id)}
        className="flex cursor-pointer bg-white items-center ml-2 rounded-md text-center">
        see scores
      </div>
    </div>
  );
}

export default QuizPreview;
