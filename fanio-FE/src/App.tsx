import '@radix-ui/themes/styles.css';
import * as RadixToast from '@radix-ui/react-toast';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import {Theme} from '@radix-ui/themes';
import Toast from './components/Toast';
import ROUTES from './constants/Routes';
import PlayScreen from './pages/PlayScreen';
import CreateScreen from './pages/CreateScreen';
import QuizListScreen from './pages/QuizListScreen';
import LandingScreen from './pages/LandingScreen';
import QuizScoreScreen from './pages/QuizScoreScreen';

function App(): JSX.Element {
  return (
    <Theme>
      <RadixToast.Provider swipeDirection="right">
        <Router>
          <Routes>
            <Route path="/" element={<LandingScreen />} />
            <Route path={`${ROUTES.playQuiz}/:id`} element={<PlayScreen />} />
            <Route path={ROUTES.createQuiz} element={<CreateScreen />} />
            <Route path={ROUTES.listQuizzes} element={<QuizListScreen />} />
            <Route
              path={`${ROUTES.quizScores}/:id`}
              element={<QuizScoreScreen />}
            />
          </Routes>
        </Router>
        <Toast />
        <RadixToast.Viewport className="ToastViewport" />
      </RadixToast.Provider>
    </Theme>
  );
}

export default App;
