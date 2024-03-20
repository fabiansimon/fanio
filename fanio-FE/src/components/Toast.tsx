import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import {
  CrossCircledIcon,
  CheckCircledIcon,
  QuestionMarkCircledIcon,
} from '@radix-ui/react-icons';
import ToastController from '../providers/ToastController';
import {Heading, Text} from '@radix-ui/themes';
import {motion} from 'framer-motion';
import {UI} from '../utils/common';

interface ModalInfo {
  title?: string;
  description?: string;
  type: ToastType;
}

interface ToastMethods {
  showErrorToast: (title?: string, description?: string) => void;
}

enum ToastType {
  ERROR,
  WARNING,
  SUCCESS,
}

const AUTOCLOSE_DURATION = 3000; // in milliseconds
const ANIMATION_DURATION = 0.2; // in seconds

function Toast(): JSX.Element {
  const ref = useRef<ToastMethods>();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [info, setInfo] = useState<ModalInfo | null>(null);

  const animationStates = {
    visible: {opacity: 1, x: 0},
    hidden: {opacity: 0, x: 100},
  };

  const {backgroundColor, defaultMessage, icon} = useMemo(() => {
    if (!info)
      return {
        backgroundColor: undefined,
        defaultMessage: undefined,
      };

    const {type} = info;
    return {
      icon: [
        <CrossCircledIcon className="text-white size-6" />,
        <QuestionMarkCircledIcon className="text-white size-6" />,
        <CheckCircledIcon className="text-white size-6" />,
      ][type],
      backgroundColor: ['bg-red-600', 'bg-orange-500', 'bg-green-600'][type],
      defaultMessage: ['Something went wrong', 'Warning', 'Success'][type],
    };
  }, [info]);

  const registerAutoClose = () => {
    setTimeout(() => {
      setIsVisible(false);
    }, AUTOCLOSE_DURATION);
    setTimeout(() => {
      setInfo(null);
    }, AUTOCLOSE_DURATION + ANIMATION_DURATION * 1000);
  };

  useLayoutEffect(() => {
    ToastController.setRef(ref);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      showErrorToast: (title?: string, description?: string) => {
        setInfo({title, description, type: ToastType.ERROR});
        setIsVisible(true);
        registerAutoClose();
      },
    }),
    [],
  );

  return (
    <motion.div
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={animationStates}
      style={{backgroundColor}}
      transition={{
        duration: ANIMATION_DURATION,
        type: 'spring',
        stiffness: 100,
        damping: 10,
        mass: 1,
      }}
      className={UI.cn(
        'absolute z-10 right-10 bottom-10 p-4 rounded-md flex items-center space-x-3',
        backgroundColor,
      )}>
      {icon}
      <div>
        <Heading className="text-white" weight={'bold'} size={'2'}>
          {info?.title || defaultMessage}
        </Heading>
        <Text size={'2'} weight={'light'} className="text-white/90">
          {info?.description}
        </Text>
      </div>
    </motion.div>
  );
}

export default forwardRef<ToastMethods>(Toast);
