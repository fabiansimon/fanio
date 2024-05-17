import {HoverCard} from '@radix-ui/themes';

function Hoverable({
  children,
  hoverContent,
}: {
  children: React.ReactNode;
  hoverContent: React.ReactNode;
}): JSX.Element {
  return (
    <HoverCard.Root>
      <HoverCard.Trigger>{children}</HoverCard.Trigger>
      <HoverCard.Content
        style={{backgroundColor: 'transparent'}}
        className="-mt-4">
        {hoverContent}
      </HoverCard.Content>
    </HoverCard.Root>
  );
}

export default Hoverable;
