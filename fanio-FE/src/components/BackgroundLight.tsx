import React, {LegacyRef, forwardRef} from 'react';
import {motion} from 'framer-motion';
import {UI} from '../utils/common';

interface BackgroundLightProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
  active?: boolean;
  onClick?: () => void;
}

function BackgroundLight(
  {
    children,
    className,
    containerClassName,
    animate = true,
    active = false,
    onClick,
  }: BackgroundLightProps,
  ref: LegacyRef<HTMLDivElement>,
) {
  const variants = {
    initial: {
      backgroundPosition: '0 0%',
      borderOpacity: 0,
    },
    animate: {
      backgroundPosition: ['0, 50%', '100% 50%', '0 50%'],
      borderOpacity: 1,
    },
  };
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={UI.cn('relative group', containerClassName)}>
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? 'initial' : undefined}
        animate={animate ? 'animate' : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: 'reverse',
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? '400% 400%' : undefined,
        }}
        className={UI.cn(
          'absolute rounded-md z-[1] opacity-30 group-hover:opacity-30 blur-xl transition duration-500',
          animate &&
            ' bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]',
        )}
      />
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? 'initial' : undefined}
        animate={animate ? 'animate' : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: 'reverse',
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? '400% 400%' : undefined,
        }}
        className={UI.cn(
          'absolute inset-0 rounded-md z-[1]',
          active &&
            'bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]',
        )}
      />

      <div className={UI.cn('relative z-10', className)}>{children}</div>
    </div>
  );
}

export default forwardRef(BackgroundLight);
