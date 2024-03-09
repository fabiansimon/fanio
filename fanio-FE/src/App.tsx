import '@radix-ui/themes/styles.css';
import * as RadixToast from '@radix-ui/react-toast';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import {Theme} from '@radix-ui/themes';
import QuizScreen from './pages/QuizScreen';
import Toast from './components/Toast';
import CreateQuizScreen from './pages/CreateQuizScreen';
import ROUTES from './constants/Routes';

function App(): JSX.Element {
  return (
    <Theme>
      <RadixToast.Provider swipeDirection="right">
        <Router>
          <Routes>
            <Route path={`${ROUTES.quiz}/:id`} element={<QuizScreen />} />
            <Route path={ROUTES.createQuiz} element={<CreateQuizScreen />} />
          </Routes>
        </Router>
        <Toast />
        <RadixToast.Viewport className="ToastViewport" />
      </RadixToast.Provider>
    </Theme>
  );
}

export default App;
