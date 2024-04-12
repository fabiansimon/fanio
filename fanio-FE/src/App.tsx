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
import {StompSessionProvider} from 'react-stomp-hooks';
import LobbyScreen from './pages/LobbyScreen';

function App(): JSX.Element {
  return (
    <>
      <Theme>
        <StompSessionProvider
          url={'http://localhost:8080/ws-endpoint'}
          onConnect={() => {
            console.log('Connected to WS');
          }}
          onDisconnect={() => {
            console.log('Disconnected from WS');
          }}>
          <Router>
            <Routes>
              <Route path="*" element={<Navigate to="/" replace={true} />} />
              <Route path="/" element={<LandingScreen />} />
              <Route
                path={`${ROUTES.playQuiz}/:id`}
                element={<PlayQuizScreen />}
              />
              <Route
                path={`${ROUTES.lobby}/:quizId/:lobbyId`}
                element={<LobbyScreen />}
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
        </StompSessionProvider>
      </Theme>
    </>
  );
}

export default App;
