import {UI} from '../utils/common';

function Logo({
  onClick,
  className,
}: {
  containerClassName?: string;
  className?: string;
  onClick?: () => void;
}): JSX.Element {
  return (
    <img
      onClick={onClick}
      src="/logo.svg"
      alt="logo"
      className={UI.cn('size-5 cursor-pointer', className)}
    />
  );
}

export default Logo;
