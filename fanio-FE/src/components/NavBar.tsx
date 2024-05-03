import {useMemo} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';
import {BarChartIcon, PlayIcon, PlusCircledIcon} from '@radix-ui/react-icons';
import {Text} from '@radix-ui/themes';
import Logo from './Logo';

function NavBar(): JSX.Element {
  const navigation = useNavigate();
  const {pathname} = useLocation();

  const linkData = useMemo(() => {
    return [
      {
        title: 'Quizzes',
        icon: <PlayIcon />,
        route: ROUTES.listQuizzes,
      },
      {
        title: 'Leaderboard',
        icon: <BarChartIcon />,
        route: ROUTES.leaderboard,
      },
      {
        title: 'Create',
        icon: <PlusCircledIcon />,
        route: ROUTES.createQuiz,
      },
    ];
  }, []);

  return (
    <nav className="bg-neutral-800/50 left-0 h-12 right-0 backdrop-blur-sm shadow-sm py-2 px-8 flex items-center fixed top-0 z-20">
      <Logo
        onClick={() => {
          navigation('/');
        }}
        className="z-10"
      />
      <ul className="flex absolute left-0 justify-center flex-grow w-full space-x-8">
        {linkData.map(({title, route, icon}, index) => {
          const {textColor} = {
            textColor: pathname === route ? 'text-white' : 'text-white/40',
          };
          return (
            <li key={index} className="min-w-18">
              <Link to={route} className="flex items-center space-x-1">
                <span className={textColor}>{icon}</span>
                <Text size={'2'} weight={'medium'} className={textColor}>
                  {title}
                </Text>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default NavBar;
