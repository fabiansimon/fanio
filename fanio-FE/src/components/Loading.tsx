import {UI} from '../utils/common';

function Loading({className}: {className?: string}): JSX.Element {
  return (
    <div className={UI.cn('loading-container', className)}>
      <div className={UI.cn('loading-spinner', className)}></div>
    </div>
  );
}

export default Loading;
