import {Text} from '@radix-ui/themes';
import {UI} from '../utils/common';

function MusicLoader({className}: {className: string}): JSX.Element {
  return (
    <div
      className={UI.cn('flex flex-col text-white h-20 space-y-9', className)}>
      <div className={UI.cn('spinner')}>
        <div className="r1"></div>
        <div className="r2"></div>
        <div className="r3"></div>
        <div className="r4"></div>
        <div className="r5"></div>
      </div>
      {/* <Text size={'1'} className="text-center mr-5 text-white/60">
        Loading Song...
      </Text> */}
    </div>
  );
}

export default MusicLoader;
