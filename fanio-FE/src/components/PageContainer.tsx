import {Heading, Text} from '@radix-ui/themes';
import {UI} from '../utils/common';
import {ArrowLeftIcon} from '@radix-ui/react-icons';
import {useNavigate} from 'react-router-dom';

interface PageContainerProps {
  className?: string;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  trailing?: React.ReactNode;
}

function PageContainer({
  className,
  children,
  title,
  description,
  trailing,
}: PageContainerProps): JSX.Element {
  const navigation = useNavigate();
  return (
    <div
      className={UI.cn(
        'bg-slate-950 flex items-center justify-center',
        className,
      )}>
      <div className="flex flex-col max-w-screen-xl w-full h-screen pb-12 px-10">
        <div className="flex items-end">
          <div className="mt-12 w-full">
            <ArrowLeftIcon
              onClick={() => navigation(-1)}
              className="size-6 cursor-pointer text-white mb-1"
            />
            <Heading size={'7'} className="text-white text-left ">
              {title}
            </Heading>
            <Text size={'4'} weight={'light'} className="text-neutral-500 pr-2">
              {description}
            </Text>
          </div>
          {trailing}
        </div>
        {children}
      </div>
    </div>
  );
}

export default PageContainer;
