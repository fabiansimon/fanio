import {Button} from '@radix-ui/themes';
import ROUTES from '../constants/Routes';
import {useNavigate} from 'react-router-dom';

interface MenuOptions {
  string: string;
  description?: string;
  route: string;
}

function LandingScreen(): JSX.Element {
  const navigation = useNavigate();
  const menuOptions: MenuOptions[] = [
    {
      string: 'See Quizzes',
      description:
        "We got everything you need. And if you don't find one you like, just create one",
      route: ROUTES.listQuizzes,
    },
    {
      string: 'Create Quiz',
      description:
        "We got everything you need. And if you don't find one you like, just create one",
      route: ROUTES.createQuiz,
    },
  ];

  return (
    <div className="flex space-y-2 flex-col text-rightl w-full h-screen bg-slate-500 items-center justify-center">
      {menuOptions.map((m, i) => (
        <Button onClick={() => navigation(m.route)} key={i}>
          {m.string}
        </Button>
      ))}
    </div>
  );
}

export default LandingScreen;
