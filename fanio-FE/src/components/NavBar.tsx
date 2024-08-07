import {useMemo} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';
import {BarChartIcon, PlayIcon, PlusCircledIcon} from '@radix-ui/react-icons';
import {Text} from '@radix-ui/themes';
import Logo from './Logo';
import Avatar from './Avatar';
import {useUserDataContext} from '../providers/UserDataProvider';
import Button from './Button';

function NavBar(): JSX.Element {
  const navigation = useNavigate();
  const {pathname} = useLocation();

  const {isAuth, openAuthModal, userData} = useUserDataContext();

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
    <nav className="bg-neutral-800/50 left-0 h-12 right-0 top-0 z-20 backdrop-blur-sm shadow-sm flex justify-center items-center">
      <div className="py-2 max-w-screen-lg px-8 items-center flex w-full fixed justify-between">
        <Logo
          onClick={() => {
            navigation('/');
          }}
          className="z-10"
        />

        {isAuth ? (
          <Avatar
            user={userData!}
            onClick={() => navigation(ROUTES.account)}
            className="size-7 border border-white/30 z-10"
          />
        ) : (
          <Button text="Sign Up/Login" onClick={openAuthModal} textSize="1" />
        )}
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
      </div>
    </nav>
  );
}

export default NavBar;
