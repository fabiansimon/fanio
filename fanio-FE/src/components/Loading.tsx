import {UI} from '../utils/common';

function Loading({className}: {className?: string}): JSX.Element {
  return (
    <div className={UI.cn('loading-container size-10', className)}>
      <div className={UI.cn('loading-spinner size-10', className)}></div>
    </div>
  );
}

export default Loading;
