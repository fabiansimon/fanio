import {Button, IconButton, Text, TextField} from '@radix-ui/themes';
import {useState} from 'react';
import {QuestionInput, QuizInput} from '../types';
import {useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';
import {createQuiz} from '../utils/api';

enum InputType {
  TITLE,
  DESCRIPTION,
  URL,
  ANSWER,
  OFFSET,
}

const MAX_QUESTIONS = 15;

function CreateQuizScreen(): JSX.Element {
  let navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [quizInput, setInput] = useState<QuizInput | null>({
    title: '',
    description: '',
    questions: [
      {
        answer: '',
        url: '',
        startOffset: 0,
      },
    ],
  });

  const uploadQuiz = async () => {
    if (!quizInput) return;
    setIsLoading(true);
    try {
      const {id} = await createQuiz(quizInput);
      navigate(`${ROUTES.quiz}/${id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInput = (value: string, type: InputType, index?: number) => {
    setInput(prev => {
      if (!prev) return null;

      switch (type) {
        case InputType.TITLE:
          return {...prev, title: value};

        case InputType.DESCRIPTION:
          return {...prev, description: value};

        case InputType.URL:
        case InputType.ANSWER:
        case InputType.OFFSET:
          if (index === undefined) return null;

          return {
            ...prev,
            questions: prev.questions.map((q, i) => {
              if (i === index) {
                return {
                  ...q,
                  ...(type === InputType.URL && {url: value}),
                  ...(type === InputType.ANSWER && {answer: value}),
                  ...(type === InputType.OFFSET && {
                    startOffset: value ? parseInt(value, 10) : 0,
                  }),
                };
              }

              return q;
            }),
          };

        default:
          console.error('Unhandled input type:', type);
          return prev;
      }
    });
  };

  const handleAddRow = () => {
    setInput(prev => {
      if (!prev) return null;

      return {
        ...prev,
        questions: prev?.questions.concat({
          answer: '',
          url: '',
          startOffset: 0,
        }),
      };
    });
  };

  return (
    <div className="flex space-y-2 flex-col text-rightl w-full h-screen bg-slate-500 items-center justify-center">
      <Text>Create quiz</Text>
      <TextField.Input
        value={quizInput?.title}
        onInput={({currentTarget: {value}}) =>
          handleInput(value, InputType.TITLE)
        }
        placeholder="Enter title"
      />
      <TextField.Input
        value={quizInput?.description}
        onInput={({currentTarget: {value}}) =>
          handleInput(value, InputType.DESCRIPTION)
        }
        placeholder="Enter Description (optional)"
      />
      {quizInput?.questions.map((question, index) => (
        <QuestionInputContainer
          key={index}
          question={question}
          handleInput={(value, type) => handleInput(value, type, index)}
        />
      ))}
      {quizInput!.questions.length < MAX_QUESTIONS && (
        <IconButton onClick={handleAddRow} />
      )}
      {!isLoading && <Button onClick={uploadQuiz}>Upload</Button>}
    </div>
  );
}

function QuestionInputContainer({
  question,
  handleInput,
}: {
  question: QuestionInput;
  handleInput: (value: string, type: InputType) => void;
}): JSX.Element {
  return (
    <div className="flex flex-col">
      <TextField.Input
        value={question.url}
        onInput={({currentTarget: {value}}) =>
          handleInput(value, InputType.URL)
        }
        placeholder="Enter url"
      />
      <div className="flex">
        <TextField.Input
          onInput={({currentTarget: {value}}) =>
            handleInput(value, InputType.ANSWER)
          }
          value={question.answer}
          placeholder="Answer"
        />
        <TextField.Input
          value={question.startOffset}
          onInput={({currentTarget: {value}}) =>
            handleInput(value, InputType.OFFSET)
          }
          placeholder="Offset by (in seconds)"
        />
      </div>
    </div>
  );
}

export default CreateQuizScreen;
