import '@radix-ui/themes/styles.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './App.css';
import {Theme} from '@radix-ui/themes';
import Toast from './components/Toast';
import ROUTES from './constants/Routes';
import CreateScreen from './pages/CreateScreen';
import QuizListScreen from './pages/QuizListScreen';
import LandingScreen from './pages/LandingScreen';
import QuizScoreScreen from './pages/QuizScoreScreen';
import LeaderboardScreen from './pages/LeaderboardScreen';
import PlayQuizScreen from './pages/PlayQuizScreen';
import {GoogleOAuthProvider} from '@react-oauth/google';
import UserDataProvider, {
  useUserDataContext,
} from './providers/UserDataProvider';
import NavBar from './components/NavBar';
import AccountScreen from './pages/AccountScreen';
import {initAxiosInterceptors} from './utils/api';
import {useLayoutEffect} from 'react';
import GameDataProvider from './providers/GameDataProvider';

const googleAuthClientId = process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID!;

function App(): JSX.Element {
  return (
    <>
      <GoogleOAuthProvider clientId={googleAuthClientId}>
        <Theme>
          <Router>
            <UserDataProvider>
              <GameDataProvider>
                <RouteContainer />
                <NavBar />
                <Toast />
              </GameDataProvider>
            </UserDataProvider>
          </Router>
        </Theme>
      </GoogleOAuthProvider>
    </>
  );
}

function RouteContainer(): JSX.Element {
  const {logoutUser} = useUserDataContext();

  // Pass logoutUser function to axios (must be in provider)
  useLayoutEffect(() => {
    initAxiosInterceptors(logoutUser);
  }, []);

  return (
    <Routes>
      <Route path="*" element={<Navigate to="/" replace={true} />} />
      <Route path="/" element={<LandingScreen />} />
      <Route path={`${ROUTES.playQuiz}/:quizId`} element={<PlayQuizScreen />} />
      <Route path={ROUTES.createQuiz} element={<CreateScreen />} />
      <Route path={ROUTES.account} element={<AccountScreen />} />
      <Route path={ROUTES.listQuizzes} element={<QuizListScreen />} />
      <Route path={ROUTES.leaderboard} element={<LeaderboardScreen />} />
      <Route path={`${ROUTES.quizScores}/:id`} element={<QuizScoreScreen />} />
    </Routes>
  );
}

export default App;
