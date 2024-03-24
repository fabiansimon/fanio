import {
  DropdownMenu,
  Heading,
  ScrollArea,
  Strong,
  Text,
} from '@radix-ui/themes';
import Button from '../components/Button';
import {PlusIcon, DotsVerticalIcon} from '@radix-ui/react-icons';
import {useMemo, useState} from 'react';
import {ButtonType, QuestionInput, QuizInput} from '../types';
import {useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';
import {uploadQuiz} from '../utils/api';
import {REGEX} from '../constants/Regex';
import InputField from '../components/InputField';
import {UI} from '../utils/common';
import PageContainer from '../components/PageContainer';
import AddQuizModal from '../components/AddQuizModal';

export enum InputType {
  TITLE,
  DESCRIPTION,
  URL,
  ERROR,
  ANSWER,
  OFFSET,
}

const MAX_QUESTIONS = 15;
const DEFAULT_QUESTION_STATE = [
  {
    answer: '',
    url: '',
    imageUri: '',
    maxLength: 0,
    startOffset: 0,
  },
];
function CreateScreen(): JSX.Element {
  const navigation = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [questionVisible, setQuestionVisible] = useState<boolean>(false);
  const [quizInput, setQuizInput] = useState<QuizInput | null>({
    title: '',
    description: '',
    questions: [],
  });

  const inputValid = useMemo(() => {
    if (!quizInput) return false;
    const {title, questions} = quizInput;
    if (title.trim() && questions.length > 1) return true;

    return false;
  }, [quizInput]);

  const handleInput = (value: string | number, type: InputType) => {
    if (typeof value === 'string' && type === InputType.URL) {
      value = value.trim();
    }

    setQuizInput(prev => {
      if (!prev) return null;
      switch (type) {
        case InputType.TITLE:
          return {...prev, title: value as string};

        case InputType.DESCRIPTION:
          return {...prev, description: value as string};

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
      const {id} = await uploadQuiz(cleanInput(quizInput!));
      navigation(`${ROUTES.playQuiz}/${id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
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

  const addQuestion = (question: QuestionInput) => {
    setQuizInput(prev => {
      if (!prev) return null;
      return {
        ...prev,
        questions: prev?.questions.concat(question),
      };
    });
    setQuestionVisible(false);
  };

  const deleteQuestion = (index: number) => {
    setQuizInput(prev => {
      if (!prev) return null;
      return {
        ...prev,
        questions: prev?.questions.filter((_, i) => i !== index),
      };
    });
  };

  const trimList = (question: QuestionInput) => {
    if (!question.answer.trim() || !question.url.trim()) return false;
    return true;
  };

  return (
    <>
      <AddQuizModal
        isVisible={questionVisible}
        onRequestClose={() => setQuestionVisible(false)}
        onSave={addQuestion}
      />
      <PageContainer
        title="Create quiz"
        description="Make sure to only use youtube links at the moment.">
        <div className="flex mt-8 space-x-4">
          {/* <div className="flex h-full w-[1px] bg-blue-500/50" /> */}
          <div className="flex flex-col w-full">
            <div className="mr-auto mt-10 mb-2">
              <Text className="text-white" weight={'medium'}>
                1. Add a Title and description
              </Text>
            </div>
            <InputField
              showSimple
              value={quizInput?.title}
              placeholder="Title"
              className="text-2xl mt-4"
              onInput={({currentTarget: {value}}) =>
                handleInput(value, InputType.TITLE)
              }
            />
            <InputField
              showSimple
              value={quizInput?.description}
              placeholder="Description (optional)"
              className="text-1xl mt-4"
              onInput={({currentTarget: {value}}) =>
                handleInput(value, InputType.DESCRIPTION)
              }
            />
            <div className="mr-auto mt-10 mb-2">
              <Text className="text-white" weight={'medium'}>
                2. Start adding some songs to guess
              </Text>
            </div>
            <ScrollArea type="always" scrollbars="vertical">
              {quizInput?.questions.map((question, index) => {
                return (
                  <QuestionPreviewContainer
                    key={index}
                    className="my-4"
                    question={question}
                    onDelete={() => deleteQuestion(index)}
                  />
                );
              })}
            </ScrollArea>
            {quizInput && quizInput?.questions.length < MAX_QUESTIONS && (
              <Button
                text="Add"
                hotkey="Enter"
                ignoreMetaKey
                onClick={() => setQuestionVisible(true)}
                icon={<PlusIcon className="text-white mr-2 size-5" />}
                className="flex mt-4 mx-auto"
                type={ButtonType.outline}
                textSize="2"
              />
            )}
          </div>
        </div>
        <Button
          text="Create"
          hotkey="C"
          disabled={!inputValid}
          onClick={createQuiz}
          loading={isLoading}
          className="flex mt-auto w-full"
          textSize="3"
        />
      </PageContainer>
    </>
  );
}

function QuestionPreviewContainer({
  question,
  onDelete,
  className,
}: {
  question: QuestionInput;
  className?: string;
  onDelete: () => void;
}): JSX.Element {
  const {answer, startOffset} = question;
  return (
    <div
      className={UI.cn(
        'flex w-full justify-between cursor-pointer',
        className,
      )}>
      <div className="flex flex-col">
        <Heading size="3" className="text-white">
          {answer}
        </Heading>
        <Text size="2" className="text-slate-200">
          Start offset: <Strong>{startOffset || 0}</Strong> sec.
        </Text>
      </div>
      <div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <DotsVerticalIcon className="text-white size-4" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            {/* <DropdownMenu.Item onClick={onEdit}>Edit</DropdownMenu.Item> */}
            <DropdownMenu.Item onClick={onDelete}> Delete</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}

export default CreateScreen;
