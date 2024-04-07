import {Heading, Text} from '@radix-ui/themes';
import {UI} from '../utils/common';
import {ArrowLeftIcon} from '@radix-ui/react-icons';
import {useNavigate} from 'react-router-dom';
import {forwardRef, Ref, useImperativeHandle, useRef, useState} from 'react';
import {motion} from 'framer-motion';
import useIsMobile from '../hooks/useIsMobile';

const BACKGROUND_ANIMATION_DURATION = 170;
const SHAKE_ANIMATION_DURATION = 20;

interface PageContainerProps {
  className?: string;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  trailing?: React.ReactNode;
}

interface PageContainerRef {
  flashColor: (color: string) => void;
  shakeContent: () => void;
}

function PageContainer(
  {className, children, title, description, trailing}: PageContainerProps,
  ref: Ref<PageContainerRef>,
): JSX.Element {
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [backgroundColor, setBackgroundColor] =
    useState<string>('bg-slate-950');

  const divRef = useRef<HTMLDivElement>(null);

  const navigation = useNavigate();
  const isMobile = useIsMobile();

  const shakeAnimation = {
    shake: {
      x: [0, -20, 20, -20, 22, 0],
      transition: {
        repeat: 0,
      },
    },
  };

  const flashColor = (color: string) => {
    setBackgroundColor(color);
    setTimeout(() => {
      setBackgroundColor('bg-slate-950');
    }, BACKGROUND_ANIMATION_DURATION);
  };

  const shakeContent = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), SHAKE_ANIMATION_DURATION);
  };

  useImperativeHandle(
    ref,
    () => ({
      flashColor,
      shakeContent,
    }),
    [],
  );

  return (
    <div
      ref={divRef}
      className={UI.cn(
        'flex items-center justify-center transition-colors ease-in-out fixed w-full',
        `duration-${BACKGROUND_ANIMATION_DURATION}`,
        backgroundColor,
        className,
      )}>
      <motion.div
        variants={shakeAnimation}
        animate={isShaking ? 'shake' : ''}
        className={UI.cn(
          'flex flex-col max-w-screen-xl w-full h-screen ',
          isMobile ? 'px-4 pb-6' : 'px-10 pb-12',
        )}>
        <div className="flex items-end">
          <div className="mt-12 w-full">
            <ArrowLeftIcon
              onClick={() => navigation(-1)}
              className="size-6 cursor-pointer text-white mb-1"
            />
            <Heading size={'7'} className="text-white text-left ">
              {title}
            </Heading>
            <Text size={'4'} weight={'light'} className="text-neutral-500 pr-2">
              {description}
            </Text>
          </div>
          {trailing}
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export default forwardRef(PageContainer);
