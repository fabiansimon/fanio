import {
  DropdownMenu,
  Heading,
  ScrollArea,
  Strong,
  Switch,
  Text,
} from '@radix-ui/themes';
import Button from '../components/Button';
import {
  PlusIcon,
  DotsVerticalIcon,
  LockClosedIcon,
} from '@radix-ui/react-icons';
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
  RANDOM_TIMESTAMP,
  PRIVATE_QUIZ,
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
    options: {
      privateAccess: false,
      randomOffsets: false,
    },
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

  const handleInput = (value: string | number | boolean, type: InputType) => {
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

        case InputType.PRIVATE_QUIZ:
          return {
            ...prev,
            options: {...prev.options, privateAccess: value as boolean},
          };

        case InputType.RANDOM_TIMESTAMP:
          return {
            ...prev,
            options: {...prev.options, randomOffsets: value as boolean},
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
      const {id} = await uploadQuiz(cleanInput(quizInput!));
      navigation(`${ROUTES.playQuiz}/${id}`);
    } catch (error) {
      console.error(error);
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
        ignoreOffset={quizInput?.options.randomOffsets}
        isVisible={questionVisible}
        onRequestClose={() => setQuestionVisible(false)}
        onSave={addQuestion}
      />
      <PageContainer
        title="Create quiz"
        description="Make sure to only use youtube links at the moment.">
        <div className="flex flex-col bg-neutral-900/20 border shadow-md shadow-black rounded-xl px-5 py-4 border-neutral-500/20 w-40vw space-x-4 mx-auto  w-full my-auto">
          {/* <div className="flex h-full w-[1px] bg-blue-500/50" /> */}
          <div className="flex flex-col w-full">
            {/* <div className="mr-auto mt-10 mb-2">
              <Text className="text-white" weight={'medium'}>
                1. Add a Title and description
              </Text>
            </div> */}

            <div className="flex mr-auto mb-4 justify-between w-full">
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
              {quizInput?.options.privateAccess && (
                <div className="bg-neutral-700/60 p-1.5 rounded-lg items-center flex mb-auto space-x-1.5">
                  <LockClosedIcon className="text-white size-3" />
                  <Text size={'1'} weight={'medium'} className="text-white">
                    Private
                  </Text>
                </div>
              )}
            </div>

            <InputField
              showSimple
              value={quizInput?.artists}
              placeholder="Artists seperated by a ','"
              className="text-md "
              onInput={({currentTarget: {value}}) =>
                handleInput(value, InputType.ARTISTS)
              }
            />

            <InputField
              showSimple
              value={quizInput?.description}
              placeholder="Description (optional)"
              className="text-1xl mt-4 mb-2 text-white/70"
              onInput={({currentTarget: {value}}) =>
                handleInput(value, InputType.DESCRIPTION)
              }
            />

            <OptionsContainer
              className="mt-2"
              onInput={(value: boolean, type: InputType) =>
                handleInput(value, type)
              }
            />

            <div className="mx-2 mt-4">
              {quizInput?.questions && quizInput?.questions.length > 0 && (
                <div className="mr-auto flex justify-between w-full">
                  <Text className="text-white" size={'2'}>
                    <Strong className="mr-1">
                      {quizInput?.questions.length}
                    </Strong>
                    {`Song${
                      (quizInput?.questions.length || 0) > 1 ? 's' : ''
                    } added`}
                  </Text>
                  <ValidationChip
                    text={containsDuplicated ? 'Duplicates' : ''}
                  />
                </div>
              )}
              <ScrollArea type="always" scrollbars="vertical">
                {quizInput?.questions.map((question, index) => {
                  return (
                    <QuestionPreviewContainer
                      ignoreOffset={quizInput.options.randomOffsets}
                      key={index}
                      className="my-4"
                      question={question}
                      onDelete={() => deleteQuestion(index)}
                    />
                  );
                })}
              </ScrollArea>
            </div>
            {quizInput && quizInput?.questions.length < MAX_QUESTIONS && (
              <Button
                text="Add Song"
                hotkey="Enter"
                ignoreMetaKey
                onClick={() => setQuestionVisible(true)}
                icon={<PlusIcon className="text-white mr-2 size-5" />}
                className="flex mt-6 mx-auto"
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
  ignoreOffset,
}: {
  question: QuestionInput;
  ignoreOffset: boolean;
  className?: string;
  onDelete: () => void;
}): JSX.Element {
  const {answer, startOffset, sourceTitle, url} = question;

  return (
    <div
      className={UI.cn(
        'flex w-full justify-between cursor-pointer',
        className,
      )}>
      <div className="flex flex-col">
        <div
          className={UI.cn('flex', ignoreOffset ? 'flex-col' : 'space-x-1.5')}>
          <Heading size="2" className="text-white">
            {answer}
          </Heading>
          <Text size="1" className="line-clamp-1">
            <a
              href={url}
              className="text-blue-500 flex line-clamp-1"
              target="_blank"
              rel="noopener noreferrer">
              {sourceTitle}
            </a>
          </Text>
        </div>
        {!ignoreOffset && (
          <Text size="1" className="text-white/80">
            Offset: <Strong>{DateUtils.formatSeconds(startOffset || 0)}</Strong>{' '}
            min
          </Text>
        )}
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

function OptionsContainer({
  className,
  onInput,
}: {
  className?: string;
  onInput: (value: boolean, type: InputType) => void;
}): JSX.Element {
  return (
    <div
      className={UI.cn(
        'flex border-neutral-500/20 border shadow-mdshadow-black rounded-xl p-3',
        className,
      )}>
      <div className="flex-col flex-grow w-full">
        <div className="flex space-x-2">
          <Heading className="text-white/80" size={'2'}>
            Random Song Start
          </Heading>
          <Switch
            size="1"
            style={{
              backgroundColor: UI.addAlpha('#ffffff', 0.2),
              borderRadius: 100,
            }}
            className="text-white"
            onCheckedChange={value =>
              onInput(value, InputType.RANDOM_TIMESTAMP)
            }
          />
        </div>
        <Text className="text-white/50" size={'2'}>
          Each Song will start at a random timestamp
        </Text>
      </div>
      <div className="flex-col flex-grow w-full border-l-neutral-500/20 border-l-[1px] pl-4">
        <div className="flex space-x-2">
          <Heading className="text-white/80" size={'2'}>
            Private Quiz
          </Heading>
          <Switch
            size="1"
            style={{
              backgroundColor: UI.addAlpha('#ffffff', 0.2),
              borderRadius: 100,
            }}
            onCheckedChange={value => onInput(value, InputType.PRIVATE_QUIZ)}
          />
        </div>
        <Text className="text-white/50" size={'2'}>
          Quiz can only be accessed through a shared URL
        </Text>
      </div>
    </div>
  );
}
export default CreateScreen;
