import {useEffect, useState} from 'react';
import {Quiz} from '../types';
import {fetchAllQuizzes} from '../utils/api';
import QuizPreview from '../components/QuizPreview';
import {useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';

function QuizListScreen(): JSX.Element {
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const navigation = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchAllQuizzes();
        setQuizzes(res);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const handleNavigation = (id: string) => {
    navigation(`${ROUTES.playQuiz}/${id}`);
  };

  const handleScoreNavigation = (id: string) => {
    navigation(`${ROUTES.quizScores}/${id}`);
  };

  return (
    <div className="flex flex-col w-full h-screen bg-slate-500 items-center justify-center">
      <div className="space-y-2">
        {quizzes?.map((q, i) => (
          <QuizPreview
            onClick={handleNavigation}
            onClickScores={handleScoreNavigation}
            key={i}
            quiz={q}
          />
        ))}
      </div>
    </div>
  );
}

export default QuizListScreen;
