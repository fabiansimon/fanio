import {useMotionTemplate, useMotionValue, motion} from 'framer-motion';
import {UI} from '../utils/common';
import {forwardRef, useEffect, useRef, useState} from 'react';
import Loading from './Loading';
import KeyBinding from './KeyBinding';

export interface InputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isLoading?: boolean;
  showSimple?: boolean;
  hotkey?: string;
}

const SimpleInputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (props, ref) => (
    <div className="flex relative">
      <input
        {...props}
        ref={ref}
        type="text"
        className={UI.cn(
          'relative bg-transparent pb-1 flex w-full text-2xl text-white font-medium text-left focus:outline-none focus:border-b-2 focus:border-white/70 border-b-2 border-b-white/10 placeholder-neutral-600',
          props.className,
        )}
      />
      {props.isLoading && <Loading className="absolute right-1 size-5 " />}
    </div>
  ),
);

function InputField(
  {
    className,
    showSimple,
    type,
    hotkey,
    isLoading = false,
    ...props
  }: InputFieldProps,
  ref: any,
) {
  const radius = 100;
  const internalRef = useRef<any>();
  const [visible, setVisible] = useState(false);

  const setRefs = (element: any) => {
    internalRef.current = element; // Assign to internal ref

    // Assign to forwarded ref
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  };

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

  if (showSimple)
    return (
      <SimpleInputField
        {...props}
        isLoading={isLoading}
        className={className}
      />
    );

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
        className,
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
          )}
          ref={setRefs}
          {...props}
        />
        {isLoading && <Loading className="size-6 mr-2" />}
        {!isLoading && hotkey && (
          <KeyBinding
            onActivate={() => internalRef.current?.focus()}
            hotkey={hotkey}
            className="mr-3"
          />
        )}
      </div>
    </motion.div>
  );
}

InputField.displayName = 'Input';

export default forwardRef(InputField);
