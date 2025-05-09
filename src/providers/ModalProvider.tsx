import { DialogContentProps } from "@radix-ui/react-dialog";
import { createContext, useMemo, useState } from "react";

export type ModalProps = {
  id?: string;
  title?: string;
  description?: string;
  content?: React.ReactNode;
  contentProps?: DialogContentProps & React.RefAttributes<HTMLDivElement>;
  disableClose?: boolean;
  hiddenClose?: boolean;
};

export type ModalContextType = ModalProps & {
  showModal: (props: ModalProps) => void;
  onClose: () => void;
  isOpen: boolean;
};

const initialState: ModalContextType = {
  showModal: () => {},
  onClose: () => {},
  isOpen: false,
};

export const ModalContext = createContext<ModalContextType>(initialState);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modal, setModal] = useState<ModalProps>({});

  function onClose() {
    setIsOpen(false);
    setModal({}); // default value
  }

  function showModal(props: ModalProps) {
    const { content } = props;

    if (content) {
      setIsOpen(true);
      setModal({ ...props });
    } else {
      onClose();
    }
  }

  const providerValue = useMemo(() => {
    return {
      showModal,
      onClose,
      isOpen,
      ...modal,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, modal]);

  return (
    <ModalContext.Provider value={providerValue}>
      {children}
    </ModalContext.Provider>
  );
};
