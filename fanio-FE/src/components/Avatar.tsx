import {UI} from '../utils/common';

function Avatar({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}): JSX.Element {
  return (
    <img
      onClick={onClick}
      src="https://i.pravatar.cc/300"
      alt="profile avatar"
      className={UI.cn(
        'rounded-full size-10 overflow-hidden',
        onClick && 'cursor-pointer',
        className,
      )}
    />
  );
}

export default Avatar;
