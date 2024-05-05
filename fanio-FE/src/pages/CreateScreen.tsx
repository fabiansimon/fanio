import {DropdownMenu, Heading, Strong, Text} from '@radix-ui/themes';
import Button from '../components/Button';
import {
  PlusIcon,
  DotsVerticalIcon,
  DiscIcon,
  MagicWandIcon,
  Cross1Icon,
  VideoIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ButtonType,
  ChipType,
  QuestionInput,
  QuestionInputType,
  QuizInput,
  StatusType,
} from '../types';
import {useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';
import {uploadQuiz} from '../utils/api';
import {REGEX} from '../constants/Regex';
import InputField from '../components/InputField';
import {DateUtils, UI} from '../utils/common';
import PageContainer from '../components/PageContainer';
import Chip from '../components/Chip';
import {GAME_OPTIONS} from '../constants/Game';
import {LocalStorage} from '../utils/localStorage';
import useIsSmall from '../hooks/useIsSmall';
import OptionsContainer from '../components/OptionsContainer';
import {motion} from 'framer-motion';
import {useUserDataContext} from '../providers/UserDataProvider';
import AuthPopUp from '../components/AuthPopUp';
import AddQuestionModal, {
  AddQuestionModalRef,
} from '../components/AddQuestionModal';
import {INIT_QUIZ_INPUT} from '../constants/Init';
import ValidationChip from '../components/ValidationChip';

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

function CreateScreen(): JSX.Element {
  const [questionInputType, setQuestionInputType] =
    useState<QuestionInputType | null>(null);
  const [quizInput, setQuizInput] = useState<QuizInput | undefined>();

  const addModalRef = useRef<AddQuestionModalRef>(null);

  const {isAuth} = useUserDataContext();

  const containsDuplicated = useMemo(() => {
    if (!quizInput?.questions) return false;
    const usedUrls = new Set();

    for (const question of quizInput?.questions) {
      if (usedUrls.has(question.url)) return true;
      usedUrls.add(question.url);
    }

    return false;
  }, [quizInput?.questions]);

  const missingAnswerIndex = useMemo(() => {
    if (!quizInput?.questions) return -1;

    for (let i = 0; i < quizInput?.questions.length; i++) {
      if (!quizInput.questions[i].answer.trim()) return i;
    }

    return -1;
  }, [quizInput]);

  const validQuizInput = useMemo(() => {
    if (!quizInput || containsDuplicated || missingAnswerIndex !== -1)
      return false;

    const {title, questions} = quizInput;
    if (title.trim() && questions.length >= GAME_OPTIONS.MIN_QUIZ_SONGS)
      return true;

    return false;
  }, [quizInput, containsDuplicated, missingAnswerIndex]);

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
          const newTitle = value as string;
          const tagTitle = newTitle.toUpperCase().trim();
          const tags = [...prev.tags];

          if (tags[0]?.includes(tagTitle.slice(0, -1))) {
            tags[0] = tagTitle;
          } else {
            tags.unshift(tagTitle);
          }

          return {...prev, title: value as string, tags};

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

  const addQuestion = (newQuestions: QuestionInput[]) => {
    const newTags = newQuestions.reduce((tagsAccumulator, question) => {
      const questionTags = Array.isArray(question.tags) ? question.tags : [];
      questionTags.forEach(tag => tagsAccumulator.add(tag));
      return tagsAccumulator;
    }, new Set(quizInput?.tags || []));

    setQuizInput(prev => {
      if (!prev) return;
      return {
        ...prev,
        tags: Array.from(newTags),
        questions: prev.questions.concat(newQuestions),
      };
    });

    setQuestionInputType(null);
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

  const addTag = (tag: string) => {
    setQuizInput(prev => {
      if (!prev || (quizInput?.tags.length || 0) >= GAME_OPTIONS.MAX_QUIZ_TAGS)
        return;

      const newTags = new Set(prev.tags);
      newTags.add(tag.trim());

      return {
        ...prev,
        tags: Array.from(newTags),
      };
    });
  };

  const removeTag = (index: number) => {
    setQuizInput(prev => {
      if (!prev) return;
      return {
        ...prev,
        tags: prev.tags.filter((_, i) => i !== index),
      };
    });
  };

  const editQuestion = (index: number) => {
    const question = quizInput?.questions[index];
    if (!question) return;
    addModalRef?.current?.editQuestion(question, index);
  };

  const replaceQuestion = (question: QuestionInput, index: number) => {
    setQuizInput(prev => {
      if (!prev) return;
      const questions = prev.questions;
      questions[index] = question;
      return {
        ...prev,
        questions,
      };
    });
  };

  const clearInput = () => {
    setQuizInput(INIT_QUIZ_INPUT);
    LocalStorage.removeUnsavedQuiz();
  };

  const songsLimitChip = useCallback(() => {
    if (!quizInput) return null;

    const amount = quizInput.questions.length;
    const max = GAME_OPTIONS.MAX_QUIZ_SONGS;
    const min = GAME_OPTIONS.MIN_QUIZ_SONGS;

    let status;
    if (amount >= max) {
      status = StatusType.ERROR;
    } else if (amount > max - 5) {
      status = StatusType.WARNING;
    } else {
      status = StatusType.NEUTRAL;
    }

    const text =
      amount === 0
        ? `Min. ${min} Songs - Max. ${max} Songs`
        : `${amount}/${max} Songs`;

    return <ValidationChip status={status} ignoreIcon text={text} />;
  }, [quizInput]);

  return (
    <>
      {/* {!isAuth && <AuthPopUp />} */}
      <AddQuestionModal
        ref={addModalRef}
        ignoreOffset={quizInput?.options.randomOffsets}
        maxAmount={
          GAME_OPTIONS.MAX_QUIZ_SONGS - (quizInput?.questions.length || 0)
        }
        isVisible={questionInputType !== null}
        type={questionInputType || QuestionInputType.SONG}
        onRequestClose={() => setQuestionInputType(null)}
        onSave={addQuestion}
        onEdit={replaceQuestion}
      />
      <PageContainer
        title="Create quiz"
        trailing={
          <Button
            text="Reset Input"
            type={ButtonType.outline}
            textSize="1"
            onClick={clearInput}
            className="w-40 mb-6"
          />
        }>
        <div className="flex-grow min-h-full overflow-y-auto">
          <div className="flex flex-col flex-grow min-h-[150%] pb-80">
            <Heading size={'4'} className="text-white">
              1. Name Quiz
            </Heading>
            <Text size={'2'} className="text-white/50">
              Make sure the title fits the theme of the quiz
            </Text>
            <div className="pt-6 flex">
              <ValidationChip
                className="mr-2 mt-1"
                status={
                  quizInput?.title ? StatusType.SUCCESS : StatusType.ERROR
                }
              />
              <div>
                <Text size={'2'} weight={'medium'} className="text-white/50">
                  Add Title
                </Text>
                <InputField
                  value={quizInput?.title}
                  showSimple
                  onInput={({currentTarget: {value}}) =>
                    handleInput(value, InputType.TITLE)
                  }
                  placeholder="e.g. Taylor Swift"
                  maxLength={GAME_OPTIONS.MAX_QUIZ_TITLE_LENGTH}
                  className="font-bold text-[20px] border-none"
                />
              </div>
            </div>
            <div className="pt-4 flex">
              <div className="size-8" />
              <div className="flex flex-col flex-grow">
                <Text size={'2'} weight={'medium'} className="text-white/50">
                  Add Description (optional)
                </Text>
                <InputField
                  showSimple
                  value={quizInput?.description}
                  placeholder="e.g. Her biggest hits 2024"
                  maxLength={GAME_OPTIONS.MAX_QUIZ_DESCRIPTION_LENGTH}
                  className="text-sm mb-2 text-white/70 max-w-[100%] pt-1 border-none"
                  onInput={({currentTarget: {value}}) =>
                    handleInput(value, InputType.DESCRIPTION)
                  }
                />
              </div>
            </div>
            <div>
              <Heading size={'4'} className="text-white pt-8">
                2. Select Options
              </Heading>
              <div className="space-y-2 mt-4">
                <OptionsContainer
                  className="mt-2"
                  onInput={(value: boolean, type: InputType) =>
                    handleInput(value, type)
                  }
                />
              </div>
            </div>
            <div className="flex flex-col w-full">
              <Heading size={'4'} className="text-white pt-8">
                3. Add Songs
              </Heading>
              <Text size={'2'} className="text-white/50">
                You can either link Youtube Videos or Youtube Playlists
              </Text>
              <div className="flex mt-2 space-x-1">
                {songsLimitChip()}
                {containsDuplicated && (
                  <ValidationChip
                    status={StatusType.ERROR}
                    onClick={removeDuplicates}
                    text="Contains Duplicates"
                  />
                )}
                {missingAnswerIndex !== -1 && (
                  <ValidationChip
                    status={StatusType.ERROR}
                    onClick={() => editQuestion(missingAnswerIndex)}
                    text="Missing Answer(s)"
                  />
                )}
              </div>
              {quizInput?.questions.map((question, index) => {
                const {answer} = question;
                const isValid = answer.trim();
                return (
                  <div key={index} className="flex mt-4 space-x-3 items-center">
                    <ValidationChip
                      status={isValid ? StatusType.SUCCESS : StatusType.ERROR}
                    />
                    <QuestionPreviewContainer
                      ignoreOffset={quizInput.options.randomOffsets}
                      question={question}
                      onDelete={() => deleteQuestion(index)}
                      onEdit={() => editQuestion(index)}
                    />
                  </div>
                );
              })}
              {/* <Text size={'1'} className="text-white/50 text-center pb-4 mt-6">
                3 songs left
              </Text> */}
              {quizInput &&
                quizInput?.questions.length < GAME_OPTIONS.MAX_QUIZ_SONGS && (
                  <div className="flex border border-neutral-700/80 rounded-xl mt-4 overflow-hidden">
                    <Button
                      textSize="2"
                      text="Add Song"
                      className="flex flex-grow hover:bg-neutral-900 rounded-none"
                      onClick={() =>
                        setQuestionInputType(QuestionInputType.SONG)
                      }
                      icon={<VideoIcon className="text-white mr-2 size-4" />}
                      type={ButtonType.text}
                    />
                    <div className="border-l border-neutral-700/80 w-0" />
                    <Button
                      textSize="2"
                      type={ButtonType.text}
                      text="Add Playlist"
                      className="flex flex-grow hover:bg-neutral-900 rounded-none"
                      onClick={() =>
                        setQuestionInputType(QuestionInputType.PLAYLIST)
                      }
                      icon={<PlusIcon className="text-white mr-2 size-5" />}
                    />
                  </div>
                )}
            </div>
          </div>
        </div>
        {quizInput && (
          <SummaryContainer
            removeTag={removeTag}
            addTag={addTag}
            quiz={quizInput}
            isValid={validQuizInput}
          />
        )}
      </PageContainer>
    </>
  );
}

function QuestionPreviewContainer({
  question,
  onDelete,
  onEdit,
  className,
  ignoreOffset,
}: {
  question: QuestionInput;
  ignoreOffset: boolean;
  className?: string;
  onDelete: () => void;
  onEdit: () => void;
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
          {answer ? (
            <Heading size="2" className="text-white">
              {answer}
            </Heading>
          ) : (
            <ValidationChip
              onClick={onEdit}
              ignoreIcon
              className="mb-1 mr-auto"
              text="Add answer"
              status={StatusType.ERROR}
            />
          )}
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
            <DropdownMenu.Item onClick={onEdit}>Edit</DropdownMenu.Item>
            <DropdownMenu.Item onClick={onDelete}> Delete</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}

function SummaryContainer({
  quiz,
  isValid,
  removeTag,
  addTag,
}: {
  quiz: QuizInput;
  isValid: boolean;
  removeTag: (index: number) => void;
  addTag: (tag: string) => void;
}): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newTag, setNewTag] = useState<string>('');
  const navigation = useNavigate();
  const isSmall = useIsSmall();

  const {
    title,
    tags,
    questions,
    description,
    options: {isPrivate, randomOffsets},
  } = quiz;

  const isQuestionValid = (question?: QuestionInput) => {
    let _question = question;
    if (!question) {
      _question = questions[questions.length - 1];
    }

    const {url, answer} = _question!;
    if (
      !(REGEX.youtubeSong.test(url) || REGEX.youtubeSong.test(url)) ||
      !answer.trim()
    )
      return false;
    return true;
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
    setIsLoading(true);
    try {
      const {id} = await uploadQuiz(cleanInput(quiz));
      LocalStorage.removeUnsavedQuiz();
      navigation(`${ROUTES.playQuiz}/${id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInput = (value: string) => {
    setNewTag(value.toUpperCase());
    if (value[value.length - 1] === ',') {
      addTag(newTag);
      setNewTag('');
    }
  };

  return (
    <motion.div
      animate={isValid ? 'visible' : 'hidden'}
      transition={{damping: 300}}
      variants={{hidden: {translateY: 1000}, visible: {translateY: 0}}}
      className="absolute bg-neutral-800/50 flex min-h-44 flex-col mb-8 pb-8 px-4 pt-4 rounded-t-2xl shadow-lg shadow-black left-0 right-0 bottom-0 backdrop-blur-sm">
      <div className="flex justify-between flex-grow">
        <div className="flex flex-col justify-between">
          <div>
            <Heading className="text-white" size={'4'}>
              {title}
            </Heading>
            <Text size={'3'} className="text-white/70">
              {description}
            </Text>
          </div>
          <>
            <Text className="text-white/50 pt-3 pb-2" size={'1'}>
              Tags to help find your quiz, make sure they fit. Seperate with a
              comma (,)
            </Text>
            <div className="border border-neutral-700/50 rounded-md p-2 mb-3 max-h-24 overflow-y-auto max-w-[80%]">
              <span className="flex-wrap flex">
                {tags.map((tag, i) => (
                  <div
                    onClick={() => removeTag(i)}
                    key={i}
                    className="flex cursor-pointer space-x-2 bg-neutral-600 rounded-md items-center justify-center py-1 px-[7px] mr-2 mb-2">
                    <Text weight={'medium'} size={'1'} className="text-white">
                      {tag}
                    </Text>
                    <Cross1Icon className="size-2 text-white" />
                  </div>
                ))}
                <InputField
                  value={newTag}
                  onInput={({currentTarget: {value}}) => handleInput(value)}
                  showSimple
                  placeholder="Add Tag"
                  className="text-xs border-none w-24 mb-1"
                />
              </span>
            </div>
          </>
          <div className="border border-neutral-500/50 bg-black/50 items-center mr-auto h-10 flex rounded-md px-2 space-x-2">
            <DiscIcon className="text-white" />
            <Text weight={'medium'} size={'2'} className="text-white/90">
              {questions.length} Songs
            </Text>
          </div>
        </div>
        <div className="flex flex-col justify-between items-end">
          <div className="flex-wrap-reverse flex space-x-1">
            {randomOffsets && <Chip type={ChipType.RANDOM_TIMESTAMPS} />}
            {isPrivate ? (
              <Chip type={ChipType.PRIVATE} />
            ) : (
              <Chip type={ChipType.PUBLIC} />
            )}
          </div>
          <Button
            onClick={createQuiz}
            loading={isLoading}
            icon={<MagicWandIcon className="text-white size-4" />}
            className="w-52"
            text="Create Quiz"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default CreateScreen;
