import '@radix-ui/themes/styles.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Theme } from '@radix-ui/themes';
import QuizScreen from './pages/QuizScreen';

function App(): JSX.Element {
  return (
    <Theme>
      <Router>
        <Routes>
          <Route path='/quiz/:id' element={<QuizScreen />} />
        </Routes>
      </Router>
    </Theme>
  );
}

export default App;
