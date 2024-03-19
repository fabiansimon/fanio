import {useMotionTemplate, useMotionValue, motion} from 'framer-motion';
import {UI} from '../utils/common';
import {LegacyRef, forwardRef, useEffect, useState} from 'react';
import Loading from './Loading';

export interface InputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: LegacyRef<HTMLInputElement> | undefined;
  isLoading?: boolean;
}

function InputField(
  {className, type, isLoading = false, ...props}: InputFieldProps,
  ref: any,
) {
  const radius = 100;
  const [visible, setVisible] = useState(false);

  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  useEffect(() => {
    if (props.value) setVisible(false);
  }, [props.value]);

  const handleMouseMove = ({currentTarget, clientX, clientY}: any) => {
    let {left, top} = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <motion.div
      style={{
        background: useMotionTemplate`
    radial-gradient(
      ${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
      white,
      transparent 90%
    )
  `,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className={UI.cn(
        'p-[2px] flex rounded-lg transition duration-300 w-full group/input',
      )}>
      <div
        className="flex items-center h-10 w-full border-none bg-gray-500 dark:bg-zinc-800 text-black dark:text-white shadow-input rounded-md text-sm  file:border-0 file:bg-transparent 
      file:text-sm file:font-medium placeholder:text-neutral-400 dark:placeholder-text-neutral-600 
       group-hover/input:shadow-none transition duration-400
       ">
        <input
          type={type}
          className={UI.cn(
            'flex px-3 py-2 h-10 w-full bg-transparent outline-none',
            className,
          )}
          ref={ref}
          {...props}
        />
        {isLoading && <Loading className="size-6 mr-2" />}
      </div>
    </motion.div>
  );
}

InputField.displayName = 'Input';

export default forwardRef(InputField);
