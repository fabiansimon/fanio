import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import ToastController from '../providers/ToastController';
import {Text} from '@radix-ui/themes';
import {motion} from 'framer-motion';

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

  const {backgroundColor, defaultMessage} = useMemo(() => {
    if (!info)
      return {
        backgroundColor: undefined,
        defaultMessage: undefined,
      };

    const {type} = info;
    return {
      backgroundColor: ['red', 'orange', 'green'][type],
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
      className="absolute z-10 right-10 bottom-10 p-4 rounded-md">
      <Text>{info?.title || defaultMessage}</Text>
      <Text>{info?.description}</Text>
    </motion.div>
  );
}

export default forwardRef<ToastMethods>(Toast);
