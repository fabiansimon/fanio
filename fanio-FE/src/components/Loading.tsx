import {Spinner} from '@radix-ui/themes';
import {UI} from '../utils/common';
import {Responsive} from '@radix-ui/themes/dist/cjs/props';

function Loading({
  className,
  size,
}: {
  className?: string;
  size?: Responsive<'1' | '2' | '3' | undefined>;
}): JSX.Element {
  return <Spinner className={UI.cn(className)} size={size} />;
}

export default Loading;
