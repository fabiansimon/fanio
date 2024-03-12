import {Button, Heading, IconButton, Text} from '@radix-ui/themes';
import {PlusIcon} from '@radix-ui/react-icons';
import {useState} from 'react';
import {QuestionInput, QuizInput} from '../types';
import {useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';
import {fetchTitleSuggestion, uploadQuiz} from '../utils/api';
import {REGEX} from '../constants/Regex';
import InputField from '../components/InputField';

enum InputType {
  TITLE,
  DESCRIPTION,
  URL,
  ANSWER,
  OFFSET,
}

const MAX_QUESTIONS = 15;

function CreateScreen(): JSX.Element {
  const navigation = useNavigate();

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

  const createQuiz = async () => {
    if (!quizInput) return;
    setIsLoading(true);
    try {
      const {id} = await uploadQuiz(quizInput);
      navigation(`${ROUTES.playQuiz}/${id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleSuggestion = async (url: string, index: number) => {
    try {
      if (!REGEX.youtube.test(url)) return;
      const title = await fetchTitleSuggestion(url);
      setInput(prev => {
        if (!prev) return null;
        return {
          ...prev,
          questions: prev?.questions.map((q, i) => {
            if (index === i) return {...q, answer: q.answer || title};
            return q;
          }),
        };
      });
    } catch {}
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

          if (type === InputType.URL) handleTitleSuggestion(value, index);

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
    <div className="flex space-y-2 w-full h-screen bg-slate-900 items-center justify-center">
      <div className="flex flex-col mx-20 w-full">
        <Heading size="6" className="text-white">
          Create quiz
        </Heading>
        <Text size="2" className="text-neutral-300">
          Make sure to only use youtube links at the moment.
        </Text>
        <div className="my-4">
          <InputField
            value={quizInput?.title}
            onInput={({currentTarget: {value}}) =>
              handleInput(value, InputType.TITLE)
            }
            placeholder="Enter title"
          />
          <InputField
            value={quizInput?.description}
            onInput={({currentTarget: {value}}) =>
              handleInput(value, InputType.DESCRIPTION)
            }
            placeholder="Enter Description (optional)"
          />
        </div>
        <div className="align-center justify-center items-center flex flex-col">
          {quizInput?.questions.map((question, index) => (
            <div className="space-y-2 flex flex-col w-full mt-4" key={index}>
              <Text className="text-white pl-2" size="2" weight={'bold'}>{`${
                index + 1
              }. Song`}</Text>
              <QuestionInputContainer
                question={question}
                handleInput={(value, type) => handleInput(value, type, index)}
              />
            </div>
          ))}
          {quizInput!.questions.length < MAX_QUESTIONS && (
            <IconButton style={{marginBlock: 10}} onClick={handleAddRow}>
              <PlusIcon />
            </IconButton>
          )}
        </div>
        {!isLoading && <Button onClick={createQuiz}>Upload</Button>}
      </div>
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
      <InputField
        value={question.url}
        onInput={({currentTarget: {value}}) =>
          handleInput(value, InputType.URL)
        }
        placeholder="Enter url"
      />
      <div className="flex">
        <InputField
          className="flex w-full"
          onInput={({currentTarget: {value}}) =>
            handleInput(value, InputType.ANSWER)
          }
          value={question.answer}
          placeholder="Answer"
        />
        <InputField
          className="flex w-full"
          value={question.startOffset || ''}
          onInput={({currentTarget: {value}}) =>
            handleInput(value, InputType.OFFSET)
          }
          placeholder="Offset by (in seconds)"
        />
      </div>
    </div>
  );
}

export default CreateScreen;
