import ReactPlayer from 'react-player';
import { Quiz } from '../types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Text, TextField  } from '@radix-ui/themes';
import { useParams } from 'react-router-dom';
import { fetchQuizById } from '../utils/api';
import { shuffle, similarity } from '../utils/logic';

const ANSWER_THRESHOLD = 80;

function QuizScreen(): JSX.Element {
  const { id } = useParams();
    
  const playerRef = useRef<ReactPlayer>(null);
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
    const [input, setInput] = useState<string>('');
    
    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const res = await fetchQuizById(id);
                setQuizData({
                    ...res,
                    questions: shuffle(res.questions)
                });
            } catch (error) {
                console.log(error);                
            }
        })()
    }, [id]);

  const question = useMemo(() => {
      if (quizData)
          return quizData.questions[questionIndex];
      
      return null;
  }, [quizData, questionIndex]);
  
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }

  const handlePlay = () => {
    if (!isPlaying) setIsPlaying(true);
  };
  
const handleSubmitGuess = () => {
    if (!input || !question?.answer) return;    

    console.log(similarity(input, question?.answer)) // DEBUG ONLY

    const isCorrect = similarity(input, question?.answer) >= ANSWER_THRESHOLD;
    setInput('');
    
    const delta = (playerRef.current?.getCurrentTime() || 0) - (question?.startOffset || 0);
    const points = playerRef.current?.getDuration()! - delta;

    if (isCorrect) {
        setScore(prev => prev += points);
        setQuestionIndex(prev => prev += 1);
        setIsPlaying(false);
        return;
    }
    
    setScore(prev => Math.max(0, prev - points/2))
  }

  const handleEnd = () => {

  }

  return (
    <div className="flex space-y-2 flex-col text-rightl w-full h-screen bg-slate-500 items-center justify-center">
        <Text>{score}</Text>
        {question && <>
            <ReactPlayer
            playing={isPlaying}
            onReady={() => {
                if (questionIndex === 0) return;
                if (question.startOffset) {
                    playerRef.current?.seekTo(question.startOffset, 'seconds');
                }
                handlePlay();
            }}
            onEnded={handleEnd}
            controls
            width={0} 
            height={0}
            ref={playerRef}
            url={question.url}
            />
            <TextField.Input
            value={input}
            onInput={handleInput}
            placeholder="Enter name of Song" />
        </>
        }
        <Button onClick={handleSubmitGuess}>Guess</Button>
        {!isPlaying && <Button onClick={handlePlay}>Play</Button>}
    </div>
  );
}

export default QuizScreen;
