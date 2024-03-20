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
import PlayQuizScreen from './pages/PlayQuizScreen';

function App(): JSX.Element {
  return (
    <>
      <Theme>
        <Router>
          <Routes>
            <Route path="*" element={<Navigate to="/" replace={true} />} />
            <Route path="/" element={<LandingScreen />} />
            <Route
              path={`${ROUTES.playQuiz}/:id`}
              element={<PlayQuizScreen />}
            />
            <Route path={ROUTES.createQuiz} element={<CreateScreen />} />
            <Route path={ROUTES.listQuizzes} element={<QuizListScreen />} />
            <Route
              path={`${ROUTES.quizScores}/:id`}
              element={<QuizScoreScreen />}
            />
          </Routes>
        </Router>
        <Toast />
      </Theme>
    </>
  );
}

export default App;
