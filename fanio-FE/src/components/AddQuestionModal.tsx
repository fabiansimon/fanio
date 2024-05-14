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
import {GAME_OPTIONS} from '../constants/Game';
import ToastController from '../controllers/ToastController';

interface AddQuestionModalProps extends ModalProps {
  ignoreOffset?: boolean;
  type?: QuestionInputType;
  maxAmount: number;
  onSave: (questions: QuestionInput[]) => void;
  onEdit: (question: QuestionInput, index: number) => void;
}

export interface AddQuestionModalRef {
  editQuestion: (question: QuestionInput, index: number) => void;
}

const ANIMATION_DURATION = 200;
const DEFAULT_MAX_VALUE = 100;
const INIT_ERROR_MESSAGE = 'Missing url';

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
    maxAmount,
    onEdit,
  }: AddQuestionModalProps,
  ref: Ref<AddQuestionModalRef>,
): JSX.Element {
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [question, setQuestion] = useState<QuestionInput>(INIT_QUESTION_INPUT);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    INIT_ERROR_MESSAGE,
  );

  const urlRef = useRef<any>();

  useKeyShortcut('Escape', onRequestClose, true);

  const isSmall = useIsSmall();

  const {url, answer, imageUri, startOffset} = question;

  const {placeholder, title, error} = useMemo(() => {
    const {youtubePlaylist, youtubeSongUrl} = GAME_OPTIONS.PLACEHOLDER;

    const isSong = type === QuestionInputType.SONG;
    return {
      placeholder: isSong ? youtubeSongUrl : youtubePlaylist,
      title: isSong ? 'Add Youtube Song' : 'Add Youtube Playlist',
      error: isSong ? 'Invalid url' : 'Invalid playlist url',
    };
  }, [type]);

  const visible = useMemo(
    () => isVisible || editIndex !== -1,
    [isVisible, editIndex],
  );

  const validUrl = useMemo(() => {
    return type === QuestionInputType.PLAYLIST
      ? REGEX.youtubePlaylist.test(url)
      : REGEX.youtubeSong.test(url);
  }, [url, type]);

  useImperativeHandle(ref, () => ({
    editQuestion: (question: QuestionInput, index: number) => {
      setEditIndex(index);
      setQuestion(question);
    },
  }));

  useEffect(() => {
    if (visible) return;
    setQuestion(INIT_QUESTION_INPUT);
    setErrorMessage(INIT_ERROR_MESSAGE);
  }, [visible]);

  useEffect(() => {
    if (visible) urlRef.current?.focus();
  }, [visible]);

  useEffect(() => {
    if (validUrl) handleMetaData();
  }, [validUrl]);

  const handleMetaData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchMetaData(url);
      if (!res.length) return;

      if (type === QuestionInputType.PLAYLIST && res.length > 1) {
        const questions: QuestionInput[] = res
          .slice(0, maxAmount)
          .map(question => {
            const {title, length, imageUri, sourceTitle, tags, sourceUrl} =
              question;
            return {
              answer: title,
              tags,
              url: sourceUrl,
              imageUri,
              maxLength: length,
              sourceTitle,
              startOffset,
            };
          });
        onSave(questions);
      } else {
        const {title, length, imageUri, sourceTitle, tags, sourceUrl} = res[0];
        setQuestion(prev => ({
          ...prev,
          answer: title,
          maxLength: length,
          imageUri,
          sourceTitle,
          tags,
          url: sourceUrl,
        }));
      }
    } catch (error) {
      ToastController.showErrorToast(
        'Oh no...',
        'Something went wrong when fetching the data. Try again in a second.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInput = (value: string | number, type: InputType) => {
    if (typeof value === 'string' && type === InputType.URL) {
      value = value.trim();
    }

    setQuestion(prev => {
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

  const expandContent = useMemo(() => {
    if (type === QuestionInputType.PLAYLIST) return false;
    return validUrl;
  }, [type, validUrl]);

  const isValid = useMemo(() => {
    if (!url.trim()) return true;
    if (!validUrl) {
      setErrorMessage(error);
      return false;
    }
    if (!answer.trim()) {
      setErrorMessage('Missing answer');
      return false;
    }

    setErrorMessage(undefined);
    return true;
  }, [answer, validUrl, url, error]);

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
            !expandContent && 'p-0 border-none',
            !isValid
              ? 'border-red-800/50 shadow-red-500'
              : 'border-neutral-600/50',
          )}>
          <div className="flex">
            <div className="absolute justify-between w-full flex -top-8">
              <div>
                <Text size={'2'} weight={'medium'} className="text-white pl-1">
                  {title}
                </Text>
              </div>
              <ValidationChip
                status={errorMessage ? StatusType.ERROR : StatusType.SUCCESS}
                text={errorMessage}
              />
            </div>
            <div className="flex flex-col space-y-1 flex-1">
              {expandContent && (
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
                className="text-xs"
                onInput={({currentTarget: {value}}) =>
                  handleInput(value, InputType.URL)
                }
                placeholder={placeholder}
              />
            </div>
            {expandContent && question.imageUri && !isSmall && (
              <ThumbnailPreview
                className="pl-4"
                imageUri={imageUri!}
                url={url}
              />
            )}
          </div>

          {!ignoreOffset && expandContent && (
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

          {expandContent && (
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
