import {UI} from '../utils/common';

function Avatar({className}: {className?: string}): JSX.Element {
  return (
    <div className={UI.cn('rounded-full size-10 overflow-hidden', className)}>
      <img src="https://i.pravatar.cc/300" alt="profile avatar" />
    </div>
  );
}

export default Avatar;
