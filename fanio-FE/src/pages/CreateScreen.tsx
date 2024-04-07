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
import {DateUtils, UI} from '../utils/common';
import PageContainer from '../components/PageContainer';
import AddQuizModal from '../components/AddQuizModal';
import ValidationChip from '../components/ValidationChip';
import {sanitizeTerm} from '../utils/logic';

export enum InputType {
  TITLE,
  DESCRIPTION,
  ARTISTS,
  URL,
  ERROR,
  ANSWER,
  OFFSET,
}

const MAX_QUESTIONS = 15;

function CreateScreen(): JSX.Element {
  const navigation = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [questionVisible, setQuestionVisible] = useState<boolean>(false);
  const [quizInput, setQuizInput] = useState<QuizInput | null>({
    title: '',
    description: '',
    artists: [],
    questions: [],
  });

  const containsDuplicated = useMemo(() => {
    if (!quizInput?.questions) return false;
    const usedTitles = new Set();
    for (const question of quizInput?.questions) {
      const cleanAnswer = sanitizeTerm(question.answer);
      if (usedTitles.has(cleanAnswer)) return true;
      usedTitles.add(cleanAnswer);
    }

    return false;
  }, [quizInput?.questions]);

  const inputValid = useMemo(() => {
    if (!quizInput || containsDuplicated) return false;
    const {title, questions} = quizInput;
    if (title.trim() && questions.length > 1) return true;

    return false;
  }, [quizInput, containsDuplicated]);

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

  return (
    <>
      <AddQuizModal
        isVisible={questionVisible}
        onRequestClose={() => setQuestionVisible(false)}
        onSave={addQuestion}
      />
      <PageContainer
        title="Create quiz"
        className="bg-slate-950"
        description="Make sure to only use youtube links at the moment.">
        <div className="flex max-h-[40%] space-x-4 min-w-[70vw] mx-auto border my-auto border-neutral-500/50 p-5 shadow-md shadow-black bg-slate-950 rounded-xl">
          {/* <div className="flex h-full w-[1px] bg-blue-500/50" /> */}
          <div className="flex flex-col w-full">
            {/* <div className="mr-auto mt-10 mb-2">
              <Text className="text-white" weight={'medium'}>
                1. Add a Title and description
              </Text>
            </div> */}
            <div className="flex flex-col mr-auto mb-4">
              <InputField
                showSimple
                value={quizInput?.title}
                placeholder="Title"
                className="text-2xl"
                trailing={
                  <ValidationChip
                    text={!quizInput?.title ? 'Missing title' : ''}
                  />
                }
                onInput={({currentTarget: {value}}) =>
                  handleInput(value, InputType.TITLE)
                }
              />
            </div>

            {/* <InputField
              showSimple
              value={quizInput?.description}
              placeholder="Add Artists Names"
              className="text-md mt-4"
              onInput={({currentTarget: {value}}) =>
                handleInput(value, InputType.ARTISTS)
              }
            /> */}

            <InputField
              showSimple
              value={quizInput?.description}
              placeholder="Description (optional)"
              className="text-1xl mt-1 mb-2 text-white/70"
              onInput={({currentTarget: {value}}) =>
                handleInput(value, InputType.DESCRIPTION)
              }
            />
            {quizInput?.questions && quizInput?.questions.length > 0 && (
              <div className="mr-auto mt-4 mb-0 flex justify-between w-full">
                <Text className="text-white" size={'2'}>
                  <Strong className="mr-1">
                    {quizInput?.questions.length}
                  </Strong>
                  {`Song${
                    (quizInput?.questions.length || 0) > 1 ? 's' : ''
                  } added`}
                </Text>
                <ValidationChip text={containsDuplicated ? 'Duplicates' : ''} />
              </div>
            )}
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
                text="Add Song"
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
        <Heading size="2" className="text-white">
          {answer}
        </Heading>
        <Text size="2" className="text-white/80">
          Start offset:{' '}
          <Strong>{DateUtils.formatSeconds(startOffset || 0)}</Strong> min
        </Text>
      </div>
      <div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <div className="p-2 -mr-2">
              <DotsVerticalIcon className="text-white size-4" />
            </div>
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
