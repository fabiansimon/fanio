import {Heading, Text} from '@radix-ui/themes';
import ROUTES from '../constants/Routes';
import {useNavigate} from 'react-router-dom';
import Spotlight from '../components/Spotlight';
import Button from '../components/Button';
import SearchContainer from '../components/SearchInput';
interface MenuOptions {
  string: string;
  description?: string;
  route: string;
  hotkey?: string;
}

function LandingScreen(): JSX.Element {
  const navigation = useNavigate();
  const menuOptions: MenuOptions[] = [
    {
      string: 'See Quizzes',
      description:
        "We got everything you need. And if you don't find one you like, just create one",
      route: ROUTES.listQuizzes,
      hotkey: 'Enter',
    },
    {
      string: 'Create Quiz',
      description:
        "We got everything you need. And if you don't find one you like, just create one",
      route: ROUTES.createQuiz,
      hotkey: 'K',
    },
  ];
  return (
    <div className="flex z-11 space-y-2 bg-slate-900 w-full h-screen items-center justify-center">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fillColor="white"
      />
      <div className="flex flex-col">
        <Heading size="5" className="text-white">
          Who is really <em>the</em> biggest fan?
        </Heading>
        <Text className="text-white pr-[30%] pt-2">
          Challenge yourself against hundreds of fans in dozens of quizzes. Will
          you be the fastest?
        </Text>
        <div className="my-4 border shadow-sm border-neutral-500 rounded-lg py-2 px-3 space-y-2">
          <Text size="2" className="text-neutral-100">
            Search for Quiz by name
          </Text>
          {/* <SearchContainer /> */}
        </div>
        <div className="flex flex-col space-y-2">
          {menuOptions.map((m, i) => (
            <Button
              hotkey={m.hotkey}
              onClick={() => navigation(m.route)}
              key={i}>
              {m.string}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LandingScreen;
