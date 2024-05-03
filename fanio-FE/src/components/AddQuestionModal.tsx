import {
  useState,
  useMemo,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  Ref,
} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {InputType} from '../pages/CreateScreen';
import {
  ButtonType,
  ModalProps,
  QuestionInput,
  QuestionInputType,
  StatusType,
} from '../types';
import {fetchMetaData} from '../utils/api';
import {REGEX} from '../constants/Regex';
import {Slider, Strong, Text} from '@radix-ui/themes';
import InputField from './InputField';
import ThumbnailPreview from './ThumbnailPreview';
import Button from './Button';
import useKeyShortcut from '../hooks/useKeyShortcut';
import ValidationChip from './ValidationChip';
import {DateUtils, UI} from '../utils/common';
import useIsSmall from '../hooks/useIsSmall';
import {INIT_QUESTION_INPUT} from '../constants/Init';

interface AddQuestionModalProps extends ModalProps {
  ignoreOffset?: boolean;
  type?: QuestionInputType;
  onSave: (questions: QuestionInput[]) => void;
  onEdit: (question: QuestionInput, index: number) => void;
}

export interface AddQuestionModalRef {
  editQuestion: (question: QuestionInput, index: number) => void;
}

const ANIMATION_DURATION = 200;
const DEFAULT_MAX_VALUE = 100;

const transition = {
  duration: ANIMATION_DURATION,
  type: 'spring',
  mass: 0.05,
};

function AddQuestionModal(
  {
    isVisible,
    type,
    onRequestClose,
    ignoreOffset,
    onSave,
    onEdit,
  }: AddQuestionModalProps,
  ref: Ref<AddQuestionModalRef>,
): JSX.Element {
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [question, setQuestion] = useState<QuestionInput>(INIT_QUESTION_INPUT);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    'Invalid url',
  );

  const urlRef = useRef<any>();

  useKeyShortcut('Escape', onRequestClose, true);

  const isSmall = useIsSmall();

  const {url, answer, imageUri, startOffset} = question;

  const visible = useMemo(
    () => isVisible || editIndex !== -1,
    [isVisible, editIndex],
  );

  useImperativeHandle(ref, () => ({
    editQuestion: (question: QuestionInput, index: number) => {
      setEditIndex(index);
      setQuestion(question);
    },
  }));

  useEffect(() => {
    if (visible) return;
    setQuestion(INIT_QUESTION_INPUT);
    setErrorMessage('Invalid url');
  }, [visible]);

  useEffect(() => {
    if (visible) urlRef.current?.focus();
  }, [visible]);

  const handleMetaData = async (url: string) => {
    setIsLoading(true);
    try {
      if (!REGEX.youtube.test(url)) return;
      const res = await fetchMetaData(url);
      if (res.length > 1 && type === QuestionInputType.PLAYLIST) {
        let questions: QuestionInput[] = [];
        for (const question of res) {
          const {
            title: answer,
            length: maxLength,
            imageUri,
            sourceTitle,
            tags,
            sourceUrl,
          } = question;

          questions.push({
            answer,
            tags,
            url: sourceUrl,
            imageUri,
            maxLength,
            sourceTitle,
            startOffset,
          });
        }
        onSave(questions);
        return;
      }

      const {title, length, imageUri, sourceTitle, tags, sourceUrl} = res[0];
      setQuestion(prev => {
        return {
          ...prev,
          answer: title,
          maxLength: length,
          imageUri,
          sourceTitle,
          tags,
          url: sourceUrl,
        };
      });
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleInput = (value: string | number, type: InputType) => {
    if (typeof value === 'string' && type === InputType.URL) {
      value = value.trim();
    }

    setQuestion(prev => {
      if (type === InputType.URL) handleMetaData(value as string);

      return {
        ...prev,
        ...(type === InputType.URL && {url: value as string}),
        ...(type === InputType.ANSWER && {answer: value as string}),
        ...(type === InputType.OFFSET && {
          startOffset: value ? (value as number) : 0,
        }),
      };
    });
  };

  const calculateOffset = (input: number) => {
    return (question.maxLength || DEFAULT_MAX_VALUE) - (input || 0);
  };

  const onClose = () => {
    onRequestClose();
    if (editIndex !== -1) setEditIndex(-1);
  };

  const handleAction = () => {
    if (editIndex !== -1) {
      onEdit(question, editIndex);
    } else {
      onSave([question]);
    }
    onClose();
  };

  const offset = useMemo(() => {
    if (!question.startOffset) return 0;
    return (
      (question.maxLength || DEFAULT_MAX_VALUE) - (question.startOffset || 0)
    );
  }, [question]);

  const validUrl = useMemo(() => {
    return REGEX.youtube.test(url);
  }, [url]);

  const isValid = useMemo(() => {
    if (!url.trim()) return true;
    if (!validUrl) {
      setErrorMessage('Invalid url');
      return false;
    }
    if (!answer.trim()) {
      setErrorMessage('Missing answer');
      return false;
    }

    setErrorMessage(undefined);
    return true;
  }, [answer, validUrl, url]);

  const backdropVariants = {
    hidden: {backdropFilter: 'blur(0px)'},
    visible: {backdropFilter: 'blur(14px)'},
  };

  const modalVariants = {
    hidden: {scale: 0.3, opacity: 0},
    visible: {scale: 1, opacity: 1},
  };

  if (!visible) return <div />;

  return (
    <AnimatePresence>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        exit="hidden"
        animate="visible"
        transition={transition}
        onClick={onRequestClose}
        className="fixed space-y-10 top-0 left-0 right-0 bottom-0 backdrop-blur-md flex w-full h-full z-10 items-center justify-center flex-col">
        <motion.div
          variants={modalVariants}
          initial="hidden"
          transition={transition}
          animate="visible"
          exit="hidden"
          onClick={event => event.stopPropagation()}
          className={UI.cn(
            'flex relative space-y-1 flex-col bg-neutral-900/90 border min-w-[50%] shadow-black rounded-xl px-2 py-3',
            !validUrl && 'p-0 border-none',
            !isValid
              ? 'border-red-800/50 shadow-red-500'
              : 'border-neutral-600/50',
          )}>
          <div className="flex">
            <ValidationChip
              status={errorMessage ? StatusType.ERROR : StatusType.SUCCESS}
              text={errorMessage}
              className="absolute right-0 -top-8 "
            />
            <div className="flex flex-col space-y-1 flex-1">
              {validUrl && (
                <InputField
                  isLoading={isLoading}
                  showSimple
                  className="text-md px-2 mb-1 placeholder-white/50"
                  onInput={({currentTarget: {value}}) =>
                    handleInput(value, InputType.ANSWER)
                  }
                  value={answer}
                  placeholder="Answer"
                />
              )}
              <InputField
                value={url}
                ref={urlRef}
                onInput={({currentTarget: {value}}) =>
                  handleInput(value, InputType.URL)
                }
                placeholder="Enter url"
              />
            </div>
            {validUrl && question.imageUri && !isSmall && (
              <ThumbnailPreview
                className="pl-4"
                imageUri={imageUri!}
                url={url}
              />
            )}
          </div>

          {!ignoreOffset && validUrl && (
            <div className="px-1 py-4 space-y-2">
              <Text size="1" className="text-white/90">
                Start offset:{' '}
                <Strong>{DateUtils.formatSeconds(startOffset || 0)}</Strong> sec
              </Text>
              <Slider
                onValueChange={(e: number[]) => {
                  handleInput(calculateOffset(e[0]), InputType.OFFSET);
                }}
                value={[offset || question.maxLength || DEFAULT_MAX_VALUE]}
                max={question.maxLength || DEFAULT_MAX_VALUE}
                inverted
                size={'1'}
              />
            </div>
          )}

          {validUrl && (
            <div className="flex justify-between mx-1 pt-4 space-x-2">
              <Button
                textSize={'2'}
                type={ButtonType.outline}
                hotkey="C"
                text="Cancel"
                onClick={onClose}
                className="flex w-full"
              />
              <Button
                textSize={'2'}
                text={editIndex !== -1 ? 'Update Song' : 'Add Song'}
                hotkey="Enter"
                onClick={handleAction}
                disabled={!isValid || !url.trim()}
                ignoreMetaKey
                className="flex w-full"
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default forwardRef<AddQuestionModalRef, AddQuestionModalProps>(
  AddQuestionModal,
);
