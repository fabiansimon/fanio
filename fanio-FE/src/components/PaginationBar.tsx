import {Select, Text} from '@radix-ui/themes';
import {UI} from '../utils/common';
import {ChevronLeftIcon, ChevronRightIcon} from '@radix-ui/react-icons';
import {useEffect, useMemo, useState} from 'react';
import {PaginationState} from '../types/index';
import {PAGE_DATA} from '../constants/Data';

interface PaginationBarProps {
  totalElements: number;
  onValueChange: (data: PaginationState) => void;
  className?: string;
  disableItemsSelector?: boolean;
  disablePageSelector?: boolean;
  initialState?: PaginationState;
}

interface PageSelectorProps {
  onValueChange: (newIndex: number) => void;
  currPage: number;
  totalElements: number;
  maxItems: number;
}

function PaginationBar({
  totalElements,
  initialState,
  onValueChange,
  className,
  disableItemsSelector,
  disablePageSelector,
}: PaginationBarProps): JSX.Element {
  const [maxItems, setMaxItems] = useState<number>(
    initialState?.maxItems || PAGE_DATA.maxItemsOptions[0],
  );
  const [pageIndex, setPageIndex] = useState<number>(
    initialState?.pageIndex || 0,
  );

  useEffect(() => {
    onValueChange({
      maxItems,
      pageIndex,
    });
  }, [maxItems, pageIndex, onValueChange]);

  return (
    <div className={UI.cn('flex justify-between w-full h-10', className)}>
      {!disablePageSelector && (
        <PageSelector
          onValueChange={setPageIndex}
          currPage={pageIndex}
          maxItems={maxItems}
          totalElements={totalElements}
        />
      )}
      {!disableItemsSelector ? (
        <MaxItemsSelector
          defaultValue={maxItems.toString()}
          onValueChange={setMaxItems}
        />
      ) : (
        <div />
      )}
    </div>
  );
}

function PageSelector({
  onValueChange,
  currPage,
  totalElements,
  maxItems,
}: PageSelectorProps): JSX.Element {
  const style =
    'flex border border-neutral-200 cursor-pointer w-8 h-8 rounded-sm justify-center items-center bg-white/100';

  const maxLength = useMemo(
    () => Math.ceil(totalElements / maxItems),
    [totalElements, maxItems],
  );
  return (
    <div className="flex space-x-[1.2px]">
      {currPage !== 0 && (
        <div onClick={() => onValueChange(currPage - 1)} className={style}>
          <ChevronLeftIcon className="text-slate-600 size-5" />
        </div>
      )}
      <div className={style}>
        <Text className="text-slate-600" size={'2'}>
          {currPage + 1}
        </Text>
      </div>
      {currPage !== maxLength - 1 && (
        <div onClick={() => onValueChange(currPage + 1)} className={style}>
          <ChevronRightIcon className="text-slate-600 size-5" />
        </div>
      )}
      {currPage < maxLength - 1 && (
        <>
          <div className="text-white mt-3 px-1">...</div>
          <div onClick={() => onValueChange(maxLength - 1)} className={style}>
            <Text className="text-slate-600" size={'2'}>
              {maxLength}
            </Text>
          </div>
        </>
      )}
    </div>
  );
}

function MaxItemsSelector({
  defaultValue,
  onValueChange,
}: {
  defaultValue: string;
  onValueChange: (value: number) => void;
}): JSX.Element {
  return (
    <Select.Root
      onValueChange={value => onValueChange(parseInt(value))}
      defaultValue={defaultValue}>
      <Select.Trigger />
      <Select.Content position="popper">
        <Select.Group>
          {PAGE_DATA.maxItemsOptions.map((m, i) => (
            <Select.Item key={i} value={m.toString()}>
              {m}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
}

export default PaginationBar;
