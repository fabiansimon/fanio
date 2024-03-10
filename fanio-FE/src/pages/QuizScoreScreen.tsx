import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {fetchScoresFromQuiz} from '../utils/api';
import {Score} from '../types';
import ScoreTile from '../components/ScoreTile';
import {LocalStorage} from '../utils/localStorage';

function QuizScoreScreen(): JSX.Element {
  const [scores, setScores] = useState<Score[] | null>(null);
  const [userScores, setUserScores] = useState<Set<string> | null>(null);
  const {id} = useParams();

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const res = await fetchScoresFromQuiz(id);
        setUserScores(LocalStorage.fetchScoreIds());
        setScores(res);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [id]);

  return (
    <div className="flex space-y-2 text-rightl w-full h-screen bg-slate-500 items-center justify-center">
      <div className="flex flex-col space-y-2 w-1/2">
        {scores?.map((s, i) => (
          <ScoreTile isLocal={userScores?.has(s.id)} key={i} score={s} />
        ))}
      </div>
    </div>
  );
}

export default QuizScoreScreen;
