import * as RadixToast from '@radix-ui/react-toast';

import {forwardRef, useState} from 'react';

/*interface ModalInfo {
  title: string;
  description?: string;
}*/

function Toast(): JSX.Element {
  //const ref = useRef();
  const [isVisible, setIsVisible] = useState<boolean>(true);
  //const [info, setInfo] = useState<ModalInfo | null>(null);

  const close = () => {
    setIsVisible(true);
  };

  return (
    <>
      <RadixToast.Root onClick={close} className="ToastRoot" open={isVisible}>
        <RadixToast.Title className="ToastTitle">
          Scheduled: Catch up
        </RadixToast.Title>
        <RadixToast.Description asChild></RadixToast.Description>
        <RadixToast.Action
          className="ToastAction"
          asChild
          altText="Goto schedule to undo">
          <button className="Button small green">Undo</button>
        </RadixToast.Action>
      </RadixToast.Root>
    </>
  );
}

export default forwardRef(Toast);
