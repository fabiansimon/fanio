import {UI} from '../utils/common';

function Logo({
  onClick,
  className,
  full,
}: {
  containerClassName?: string;
  className?: string;
  full?: boolean;
  onClick?: () => void;
}): JSX.Element {
  if (full)
    return (
      <img
        onClick={onClick}
        src="/full_logo.svg"
        alt="logo"
        className={UI.cn('size-10 cursor-pointer', className)}
      />
    );
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
