import {Text} from '@radix-ui/themes';
import {Score} from '../types';
import {DateUtils} from '../utils/common';
import {ToastTitle} from '@radix-ui/react-toast';

function ScoreTile({score}: {score: Score}): JSX.Element {
  const {userName, timeElapsed, totalScore, createdAt} = score;
  return (
    <div className="flex w-full justify-between bg-white rounded-md p-2">
      <div className="flex flex-col">
        <Text>{userName}</Text>
        <Text>{DateUtils.formatDate(createdAt)}</Text>
      </div>
      <div className="flex flex-col text-right">
        <Text>{`${totalScore.toFixed(2)} pts`}</Text>
        <Text>{DateUtils.formatTime(timeElapsed, 'sec')}</Text>
      </div>
    </div>
  );
}

export default ScoreTile;
