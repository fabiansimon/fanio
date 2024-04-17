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
import UserDataProvider from './providers/UserDataProvider';

const googleAuthClientId = process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID!;

function App(): JSX.Element {
  return (
    <>
      <GoogleOAuthProvider clientId={googleAuthClientId}>
        <UserDataProvider>
          <Theme>
            <Router>
              <Routes>
                <Route path="*" element={<Navigate to="/" replace={true} />} />
                <Route path="/" element={<LandingScreen />} />
                <Route
                  path={`${ROUTES.playQuiz}/:quizId`}
                  element={<PlayQuizScreen />}
                />

                <Route path={ROUTES.createQuiz} element={<CreateScreen />} />
                <Route path={ROUTES.listQuizzes} element={<QuizListScreen />} />
                <Route
                  path={ROUTES.leaderboard}
                  element={<LeaderboardScreen />}
                />
                <Route
                  path={`${ROUTES.quizScores}/:id`}
                  element={<QuizScoreScreen />}
                />
              </Routes>
            </Router>
            <Toast />
          </Theme>
        </UserDataProvider>
      </GoogleOAuthProvider>
    </>
  );
}

export default App;
