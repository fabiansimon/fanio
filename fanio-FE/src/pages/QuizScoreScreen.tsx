import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {fetchScoresFromQuiz} from '../utils/api';
import {Score} from '../types';
import ScoreTile from '../components/ScoreTile';

function QuizScoreScreen(): JSX.Element {
  const [scores, setScores] = useState<Score[] | null>(null);
  const {id} = useParams();

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const res = await fetchScoresFromQuiz(id);
        console.log(res);
        setScores(res);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [id]);

  return (
    <div className="flex space-y-2 flex-col text-rightl w-full h-screen bg-slate-500 items-center justify-center">
      <div className="flex w-1/2">
        {scores?.map((s, i) => (
          <ScoreTile key={i} score={s} />
        ))}
      </div>
    </div>
  );
}

export default QuizScoreScreen;
