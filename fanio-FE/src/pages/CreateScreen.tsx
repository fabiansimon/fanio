import {
  DropdownMenu,
  Heading,
  ScrollArea,
  Strong,
  Text,
} from '@radix-ui/themes';
import Button from '../components/Button';
import {PlusIcon, DotsVerticalIcon, Cross1Icon} from '@radix-ui/react-icons';
import {useEffect, useMemo, useRef, useState} from 'react';
import {ButtonType, ChipType, QuestionInput, QuizInput} from '../types';
import {useNavigate} from 'react-router-dom';
import ROUTES from '../constants/Routes';
import {uploadQuiz} from '../utils/api';
import {REGEX} from '../constants/Regex';
import InputField from '../components/InputField';
import {DateUtils, UI} from '../utils/common';
import PageContainer from '../components/PageContainer';
import ValidationChip from '../components/ValidationChip';
import HoverContainer from '../components/HoverContainer';
import Chip from '../components/Chip';
import {GAME_OPTIONS} from '../constants/Game';
import {LocalStorage} from '../utils/localStorage';
import useIsSmall from '../hooks/useIsSmall';
import OptionsContainer from '../components/OptionsContainer';
import {useUserDataContext} from '../providers/UserDataProvider';
import AuthPopUp from '../components/AuthPopUp';
import AddQuestionModal, {
  AddQuestionModalRef,
} from '../components/AddQuestionModal';

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
  tags: [],
  options: {
    isPrivate: false,
    randomOffsets: false,
  },
};

function CreateScreen(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [questionVisible, setQuestionVisible] = useState<boolean>(false);
  const [quizInput, setQuizInput] = useState<QuizInput | undefined>();

  const addModalRef = useRef<AddQuestionModalRef>(null);

  const navigation = useNavigate();
  const isSmall = useIsSmall();
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

  return (
    <>
      {/* {!isAuth && <AuthPopUp />} */}
      <AddQuestionModal
        ref={addModalRef}
        ignoreOffset={quizInput?.options.randomOffsets}
        isVisible={questionVisible}
        onRequestClose={() => setQuestionVisible(false)}
        onSave={addQuestion}
        onEdit={replaceQuestion}
      />
      <PageContainer
        title="Create quiz"
        description="Make sure to only use youtube links at the moment.">
        <div>
          <Heading className="text-white">1. Name Quiz</Heading>
        </div>
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
            <DropdownMenu.Item onClick={onEdit}>Edit</DropdownMenu.Item>
            <DropdownMenu.Item onClick={onDelete}> Delete</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}

export default CreateScreen;
