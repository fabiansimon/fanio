import {
  DropdownMenu,
  Heading,
  ScrollArea,
  Strong,
  Switch,
  Text,
} from '@radix-ui/themes';
import Button from '../components/Button';
import {PlusIcon, DotsVerticalIcon} from '@radix-ui/react-icons';
import {useEffect, useMemo, useState} from 'react';
import {ButtonType, ChipType, QuestionInput, QuizInput} from '../types';
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
import HoverContainer from '../components/HoverContainer';
import Chip from '../components/Chip';
import {GAME_OPTIONS} from '../constants/Game';
import {LocalStorage} from '../utils/localStorage';
import useIsSmall from '../hooks/useIsSmall';
import OptionsContainer from '../components/OptionsContainer';

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

const INIT_QUIZ_INPUT = {
  title: '',
  description: '',
  artists: [],
  questions: [],
  options: {
    isPrivate: false,
    randomOffsets: false,
  },
};

function CreateScreen(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [questionVisible, setQuestionVisible] = useState<boolean>(false);
  const [quizInput, setQuizInput] = useState<QuizInput | undefined>();

  const navigation = useNavigate();
  const isSmall = useIsSmall();
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
    if (title.trim() && questions.length >= GAME_OPTIONS.MIN_QUIZ_SONGS)
      return true;

    return false;
  }, [quizInput, containsDuplicated]);

  useEffect(() => {
    const storedQuizInput = LocalStorage.fetchUnsavedQuiz();
    setQuizInput(storedQuizInput || INIT_QUIZ_INPUT);
  }, []);

  useEffect(() => {
    if (!quizInput) return;
    LocalStorage.saveUnsavedQuiz(quizInput);
  }, [quizInput]);

  const handleInput = (value: string | number | boolean, type: InputType) => {
    if (typeof value === 'string' && type === InputType.URL) {
      value = value.trim();
    }

    setQuizInput(prev => {
      if (!prev) return;
      switch (type) {
        case InputType.TITLE:
          return {...prev, title: value as string};

        case InputType.DESCRIPTION:
          return {...prev, description: value as string};

        case InputType.PRIVATE_QUIZ:
          return {
            ...prev,
            options: {...prev.options, isPrivate: value as boolean},
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
      LocalStorage.removeUnsavedQuiz();
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

  const removeDuplicates = () => {
    const urls = new Set();
    setQuizInput(prev => {
      if (!prev) return;
      return {
        ...prev,
        questions: prev.questions.filter(q => {
          if (urls.has(q.url)) return false;
          urls.add(q.url);
          return true;
        }),
      };
    });
  };

  const addQuestion = (question: QuestionInput) => {
    setQuizInput(prev => {
      if (!prev) return;
      return {
        ...prev,
        questions: prev?.questions.concat(question),
      };
    });
    setQuestionVisible(false);
  };

  const deleteQuestion = (index: number) => {
    setQuizInput(prev => {
      if (!prev) return;
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
        {/* <div className="flex flex-col bg-neutral-900/20 border shadow-md shadow-black rounded-xl px-5 py-4 border-neutral-500/20 w-40vw space-x-4 mx-auto  w-full my-auto"> */}
        <HoverContainer className="my-auto px-4 max-h-[70%]">
          {/* <div className="flex h-full w-[1px] bg-blue-500/50" /> */}
          <div className="flex flex-col flex-grow">
            {/* <div className="mr-auto mt-10 mb-2">
              <Text className="text-white" weight={'medium'}>
                1. Add a Title and description
              </Text>tit
            </div> */}

            <div className="flex mr-auto mb-4 justify-between w-full">
              <InputField
                showSimple
                value={quizInput?.title}
                placeholder="Title"
                maxLength={GAME_OPTIONS.MAX_QUIZ_TITLE_LENGTH}
                className="text-xl"
                trailing={
                  <ValidationChip
                    text={!quizInput?.title ? 'Missing title' : ''}
                  />
                }
                onInput={({currentTarget: {value}}) =>
                  handleInput(value, InputType.TITLE)
                }
              />
              {quizInput?.options.isPrivate && (
                <Chip
                  className={isSmall ? '-mt-14 -mr-2' : ''}
                  type={ChipType.PRIVATE}
                />
              )}
            </div>
            {/* 
            <InputField
              showSimple
              value={quizInput?.artists}
              placeholder="Artists seperated by a ','"
              className="text-sm "
              onInput={({currentTarget: {value}}) =>
                handleInput(value, InputType.ARTISTS)
              }
            /> */}

            <InputField
              showSimple
              value={quizInput?.description}
              placeholder="Description (optional)"
              maxLength={GAME_OPTIONS.MAX_QUIZ_DESCRIPTION_LENGTH}
              className="text-sm mb-2 text-white/70 h-50"
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
                <>
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
                  {containsDuplicated && (
                    <Text
                      onClick={removeDuplicates}
                      size={'1'}
                      className="text-white/50 underline cursor-pointer">
                      Remove Duplicates
                    </Text>
                  )}
                </>
              )}
              <ScrollArea scrollbars="vertical" type="always">
                {quizInput?.questions.map((question, index) => (
                  <QuestionPreviewContainer
                    className="mt-4"
                    ignoreOffset={quizInput.options.randomOffsets}
                    key={index}
                    question={question}
                    onDelete={() => deleteQuestion(index)}
                  />
                ))}
              </ScrollArea>
            </div>

            {quizInput &&
              quizInput?.questions.length < GAME_OPTIONS.MAX_QUIZ_SONGS && (
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
          <Text
            onClick={() => setQuizInput(INIT_QUIZ_INPUT)}
            size={'1'}
            className="text-white/50 underline cursor-pointer pt-4">
            Reset Input
          </Text>
        </HoverContainer>
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

export default CreateScreen;
