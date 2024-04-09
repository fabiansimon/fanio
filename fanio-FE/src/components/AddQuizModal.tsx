import {useState, useMemo, useEffect, useRef} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {InputType} from '../pages/CreateScreen';
import {ButtonType, ModalProps, QuestionInput} from '../types';
import {fetchMetaData} from '../utils/api';
import {REGEX} from '../constants/Regex';
import {Slider, Strong, Text} from '@radix-ui/themes';
import InputField from './InputField';
import ThumbnailPreview from './ThumbnailPreview';
import Button from './Button';
import useKeyShortcut from '../hooks/useKeyShortcut';
import ValidationChip from './ValidationChip';
import {DateUtils} from '../utils/common';

interface AddQuizModalProps extends ModalProps {
  onSave: (quiz: QuestionInput) => void;
}

const ANIMATION_DURATION = 200;

const transition = {
  duration: ANIMATION_DURATION,
  type: 'spring',
  mass: 0.05,
};

function AddQuizModal({
  isVisible,
  onRequestClose,
  onSave,
}: AddQuizModalProps): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    'Invalid url',
  );
  const defaultMaxValue = 100;
  const [question, setQuestion] = useState<QuestionInput>({
    answer: '',
    url: '',
    sourceTitle: '',
  });
  const urlRef = useRef<any>();

  useKeyShortcut('Escape', onRequestClose, true);

  const {url, answer, imageUri, startOffset} = question;

  useEffect(() => {
    if (isVisible) return;
    setTimeout(() => {
      setQuestion({answer: '', url: '', sourceTitle: ''});
      setErrorMessage('Invalid url');
    }, ANIMATION_DURATION);
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) urlRef.current?.focus();
  }, [isVisible]);

  const handleMetaData = async (url: string) => {
    setIsLoading(true);
    try {
      if (!REGEX.youtube.test(url)) return;
      const res = await fetchMetaData(url);
      const {title, length, imageUri, sourceTitle} = res;
      setQuestion(prev => {
        return {
          ...prev,
          answer: title,
          maxLength: length,
          imageUri,
          sourceTitle,
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
    return (question.maxLength || defaultMaxValue) - (input || 0);
  };

  const offset = useMemo(() => {
    if (!question.startOffset) return 0;
    return (
      (question.maxLength || defaultMaxValue) - (question.startOffset || 0)
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

    setErrorMessage(null);
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

  if (!isVisible) return <div />;

  return (
    <AnimatePresence>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        exit="hidden"
        animate="visible"
        transition={transition}
        onClick={onRequestClose}
        className="absolute backdrop-blur-md flex w-full h-full z-10 items-center justify-center flex-col">
        <motion.div
          variants={modalVariants}
          initial="hidden"
          transition={transition}
          animate="visible"
          exit="hidden"
          onClick={event => event.stopPropagation()}
          className={`flex relative space-y-1 flex-col bg-neutral-900/90 border w-2/3 shadow-black rounded-xl px-2 py-3 ${
            !isValid ? 'border-red-800/50' : 'border-neutral-500/50'
          } ${!isValid && 'shadow-red-500'}`}>
          <div className="flex">
            <ValidationChip
              text={errorMessage || ''}
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
            {validUrl && question.imageUri && (
              <ThumbnailPreview
                className="pl-4"
                imageUri={imageUri!}
                url={url}
              />
            )}
          </div>

          {validUrl && (
            <div className="px-1 py-4 space-y-2">
              <Text size="1" className="text-white/90">
                Start offset:{' '}
                <Strong>{DateUtils.formatSeconds(startOffset || 0)}</Strong> sec
              </Text>
              <Slider
                onValueChange={(e: number[]) => {
                  handleInput(calculateOffset(e[0]), InputType.OFFSET);
                }}
                value={[offset || question.maxLength || defaultMaxValue]}
                max={question.maxLength || defaultMaxValue}
                inverted
                size={'1'}
                defaultValue={[100]}
              />
            </div>
          )}

          {validUrl && (
            <div className="flex justify-between mx-1 pt-2 space-x-2">
              <Button
                textSize={'2'}
                type={ButtonType.outline}
                hotkey="R"
                text="Cancel"
                onClick={() => onRequestClose()}
                className="flex w-full"
              />
              <Button
                textSize={'2'}
                text="Add Song"
                hotkey="Enter"
                onClick={() => onSave(question)}
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

export default AddQuizModal;
