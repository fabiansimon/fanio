import {Heading, IconButton, Slider, Strong, Text} from '@radix-ui/themes';
import Button from '../components/Button';
import {PlusIcon} from '@radix-ui/react-icons';
import {useMemo, useState} from 'react';
import {QuestionInput, QuizInput} from '../types';
import {useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';
import {fetchMetaData, uploadQuiz} from '../utils/api';
import {REGEX} from '../constants/Regex';
import InputField from '../components/InputField';
import {DateUtils} from '../utils/common';

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
        maxLength: 0,
      },
    ],
  });

  const handleError = (type: InputType, index?: number) => {
    console.log('ERROR:', type, index);
    return false;
  };

  const validInput = useMemo(() => {
    if (!quizInput) return false;
    const {title, questions} = quizInput;

    let valid = true;
    if (!title.trim()) {
      valid = handleError(InputType.TITLE);
    }

    for (var i = 0; i < questions.length; i++) {
      const {url, answer} = questions[i];
      if (!REGEX.youtube.test(url)) valid = handleError(InputType.URL, i);
      if (!answer.trim()) valid = handleError(InputType.ANSWER, i);
    }

    return valid;
  }, [quizInput]);

  const cleanInput = (input: QuizInput) => {
    return {
      ...input,
      questions: input.questions.map(q => {
        delete q.maxLength;
        return q;
      }),
    };
  };

  const createQuiz = async () => {
    if (!quizInput) return;
    setIsLoading(true);
    try {
      const {id} = await uploadQuiz(cleanInput(quizInput));
      navigation(`${ROUTES.playQuiz}/${id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetaData = async (url: string, index: number) => {
    try {
      if (!REGEX.youtube.test(url)) return;
      const {title, length} = await fetchMetaData(url);

      setInput(prev => {
        if (!prev) return null;
        return {
          ...prev,
          questions: prev?.questions.map((q, i) => {
            if (index === i)
              return {...q, answer: q.answer || title, maxLength: length};
            return q;
          }),
        };
      });
    } catch {}
  };

  const handleInput = (
    value: string | number,
    type: InputType,
    index?: number,
  ) => {
    setInput(prev => {
      if (!prev) return null;

      switch (type) {
        case InputType.TITLE:
          return {...prev, title: value as string};

        case InputType.DESCRIPTION:
          return {...prev, description: value as string};

        case InputType.URL:
        case InputType.ANSWER:
        case InputType.OFFSET:
          if (index === undefined) return null;

          if (type === InputType.URL) handleMetaData(value as string, index);

          return {
            ...prev,
            questions: prev.questions.map((q, i) => {
              if (i === index) {
                return {
                  ...q,
                  ...(type === InputType.URL && {url: value as string}),
                  ...(type === InputType.ANSWER && {answer: value as string}),
                  ...(type === InputType.OFFSET && {
                    startOffset: value ? (value as number) : 0,
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
          maxLength: 0,
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
        <div className="my-4 space-y-1">
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
              }: Song`}</Text>
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
        {!isLoading && (
          <Button disabled={!validInput} hotkey="C" onClick={createQuiz}>
            Upload
          </Button>
        )}
      </div>
    </div>
  );
}

function QuestionInputContainer({
  question,
  handleInput,
}: {
  question: QuestionInput;
  handleInput: (value: string | number, type: InputType) => void;
}): JSX.Element {
  const defaultMaxValue = 100;

  const calculateOffset = (input: number) => {
    return (question.maxLength || defaultMaxValue) - (input || 0);
  };

  const offset = useMemo(() => {
    if (!question.startOffset) return 0;
    return (
      (question.maxLength || defaultMaxValue) - (question.startOffset || 0)
    );
  }, [question]);

  return (
    <div className="flex space-y-1 flex-col">
      <InputField
        value={question.url}
        onInput={({currentTarget: {value}}) =>
          handleInput(value, InputType.URL)
        }
        placeholder="Enter url"
      />
      <div className="flex space-x-1">
        <InputField
          className="flex "
          onInput={({currentTarget: {value}}) =>
            handleInput(value, InputType.ANSWER)
          }
          value={question.answer}
          placeholder="Answer"
        />
      </div>
      <Text size="2" className="text-slate-200 pt-4 pb-2">
        Start offset: <Strong>{question.startOffset}</Strong> seconds
      </Text>
      <Slider
        onValueChange={(e: number[]) => {
          handleInput(calculateOffset(e[0]), InputType.OFFSET);
        }}
        value={[offset || question.maxLength || defaultMaxValue]}
        max={question.maxLength || defaultMaxValue}
        inverted
        defaultValue={[100]}
      />
      <div className="flex justify-between pt-2">
        <Text size="1" className="text-white">
          0:00
        </Text>
        {question.maxLength && (
          <Text size="1" className="text-white">
            {DateUtils.formatSeconds(question.maxLength)}
          </Text>
        )}
      </div>
    </div>
  );
}

export default CreateScreen;
