import {useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import ROUTES from '../constants/Routes';
import {HeadingIcon} from '@radix-ui/react-icons';
import {Text} from '@radix-ui/themes';

function NavBar(): JSX.Element {
  const [pageIndex, setPageIndex] = useState<number>(-1);
  const linkData = useMemo(() => {
    return [
      {
        title: 'Quizzes',
        route: ROUTES.listQuizzes,
      },
      {
        title: 'Leaderboard',
        route: ROUTES.leaderboard,
      },
      {
        title: 'Create',
        route: ROUTES.createQuiz,
      },
    ];
  }, []);

  return (
    <nav className="bg-neutral-800/50 left-0 h-12 right-0 backdrop-blur-sm shadow-sm py-2 px-8 flex items-center fixed top-0 z-20">
      <LogoContainer />
      <ul className="flex absolute left-0 justify-center flex-grow w-full space-x-6">
        {linkData.map(({title, route}, index) => {
          const {textColor} = {
            textColor: pageIndex === index ? 'text-white' : 'text-white/40',
          };
          return (
            <li key={index} className="min-w-18">
              <Link onClick={() => setPageIndex(index)} to={route}>
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

function LogoContainer(): JSX.Element {
  return <HeadingIcon />;
}

export default NavBar;
