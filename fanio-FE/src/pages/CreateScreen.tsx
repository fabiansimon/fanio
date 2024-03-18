import {Heading, IconButton, Slider, Strong, Text} from '@radix-ui/themes';
import Button from '../components/Button';
import {PlusIcon, ChevronDownIcon} from '@radix-ui/react-icons';
import {useMemo, useState} from 'react';
import {QuestionInput, QuizInput} from '../types';
import {useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';
import {fetchMetaData, uploadQuiz} from '../utils/api';
import {REGEX} from '../constants/Regex';
import InputField from '../components/InputField';
import {DateUtils, UI} from '../utils/common';

enum InputType {
  TITLE,
  DESCRIPTION,
  URL,
  ERROR,
  ANSWER,
  OFFSET,
}

const MAX_QUESTIONS = 15;

function CreateScreen(): JSX.Element {
  const navigation = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [quizInput, setQuizInput] = useState<QuizInput | null>({
    title: '',
    description: '',
    questions: [
      {
        answer: '',
        url: '',
        imageUri: '',
        maxLength: 0,
        startOffset: 0,
      },
    ],
  });
  const [focusIndex, setFocusIndex] = useState<number>(0);

  const handleInput = (
    value: string | number,
    type: InputType,
    index?: number,
  ) => {
    setQuizInput(prev => {
      if (!prev) return null;
      switch (type) {
        case InputType.TITLE:
          return {...prev, title: value as string};

        case InputType.DESCRIPTION:
          return {...prev, description: value as string};

        case InputType.URL:
        case InputType.ANSWER:
        case InputType.ERROR:
        case InputType.OFFSET:
          if (index === undefined) return null;

          if (type === InputType.URL) handleMetaData(value as string, index);

          return {
            ...prev,
            questions: prev?.questions.map((q, i) => {
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

  const cleanInput = (input: QuizInput) => {
    return {
      ...input,
      questions: input.questions
        .filter(q => isQuestionValid(q))
        .map(q => {
          delete q.maxLength;
          delete q.imageUri;
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
      const res = await fetchMetaData(url);
      const {title, length, imageUri} = res;
      setQuizInput(prev => {
        if (!prev) return null;
        return {
          ...prev,
          questions: prev?.questions.map((q, i) => {
            if (index === i)
              return {
                ...q,
                answer: q.answer || title,
                maxLength: length,
                imageUri: imageUri,
              };
            return q;
          }),
        };
      });
    } catch {}
  };

  const isQuestionValid = (question?: QuestionInput) => {
    let _question = question;
    if (!question) {
      _question = quizInput?.questions[quizInput.questions.length - 1];
    }

    const {url, answer} = _question!;
    if (!REGEX.youtube.test(url) || !answer.trim()) return false;
    return true;
  };

  const trimList = () => {
    setQuizInput(prev => {
      if (!prev) return null;
      return {
        ...prev,
        questions: prev?.questions.filter(q => isQuestionValid(q)),
      };
    });
  };

  const handleAddRow = () => {
    setFocusIndex(quizInput?.questions.length || 0);
    setQuizInput(prev => {
      if (!prev) return null;
      return {
        ...prev,
        questions: prev.questions.concat({
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
          {quizInput?.questions.map((question, index) => {
            if (focusIndex === index) {
              return (
                <div
                  className="space-y-2 flex flex-col w-full mt-4"
                  key={index}>
                  <div className="flex w-full justify-between">
                    <Text
                      className="text-white pl-2"
                      size="2"
                      weight={'bold'}>{`${index + 1}: Song`}</Text>
                    {error && (
                      <Text
                        className="text-red-600 pl-2"
                        size="2"
                        weight={'bold'}>
                        {error}
                      </Text>
                    )}
                  </div>
                  <QuestionInputContainer
                    question={question}
                    handleInput={(value, type) =>
                      handleInput(value, type, index)
                    }
                  />
                </div>
              );
            }

            return (
              <QuestionPreviewContainer
                className="mt-4"
                key={index}
                question={question}
                onClick={() => {
                  trimList();
                  setFocusIndex(index);
                }}
              />
            );
          })}

          {isQuestionValid() && (
            <IconButton style={{marginBlock: 10}} onClick={handleAddRow}>
              <PlusIcon />
            </IconButton>
          )}
        </div>
        {!isLoading && (
          <Button style={{marginTop: 12}} hotkey="C" onClick={createQuiz}>
            Upload
          </Button>
        )}
      </div>
    </div>
  );
}

function QuestionPreviewContainer({
  question,
  onClick,
  className,
}: {
  question: QuestionInput;
  className?: string;
  onClick: () => void;
}): JSX.Element {
  const {answer, startOffset} = question;
  return (
    <div className={UI.cn('flex w-full justify-between', className)}>
      <div className="flex flex-col">
        <Heading size="3" className="text-white">
          {answer}
        </Heading>
        <Text size="2" className="text-slate-200">
          Offset: <Strong>{startOffset}</Strong> sec
        </Text>
      </div>
      <div onClick={onClick}>
        <ChevronDownIcon className="text-white size-8" />
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
  const {url, answer, imageUri, startOffset, maxLength} = question;
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
      <div className="flex">
        <div className="flex flex-col space-y-1 flex-1">
          <InputField
            value={url}
            onInput={({currentTarget: {value}}) =>
              handleInput(value, InputType.URL)
            }
            placeholder="Enter url"
          />
          <InputField
            className="flex"
            onInput={({currentTarget: {value}}) =>
              handleInput(value, InputType.ANSWER)
            }
            value={answer}
            placeholder="Answer"
          />
        </div>
        {question.imageUri && (
          <ThumbnailPreview className="ml-2" imageUri={imageUri!} url={url} />
        )}
      </div>

      <div className="flex justify-between pt-2 pb-1">
        <Text size="1" className="text-white">
          0:00
        </Text>
        <Text size="2" className="text-slate-200">
          Start offset: <Strong>{startOffset}</Strong> sec
        </Text>
        {maxLength && (
          <Text size="1" className="text-white">
            {DateUtils.formatSeconds(maxLength)}
          </Text>
        )}
      </div>
      <Slider
        onValueChange={(e: number[]) => {
          handleInput(calculateOffset(e[0]), InputType.OFFSET);
        }}
        value={[offset || question.maxLength || defaultMaxValue]}
        max={question.maxLength || defaultMaxValue}
        inverted
        defaultValue={[100]}
      />
    </div>
  );
}

function ThumbnailPreview({
  url,
  imageUri,
  className,
}: {
  url: string;
  imageUri: string;
  className?: string;
}): JSX.Element {
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <img
        src={imageUri}
        alt="video thumbnail"
        className={UI.cn('w-32 rounded-md cursor-pointer', className)}
      />
    </a>
  );
}

export default CreateScreen;
