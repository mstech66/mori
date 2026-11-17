"use client";

import { createContext, useContext, useState } from "react";
import NoteModal from "./NoteModal";
import React from "react";

export interface ModalStoreProps {
  open: boolean;
  [key: string]: unknown;
}

export interface ModalStore {
  props: ModalStoreProps;
}

export interface ModalContextType {
  store?: ModalStore;
  showModal: (props?: Record<string, unknown>) => void;
  hideModal: (props?: Record<string, unknown>) => void;
}

const initialState: ModalContextType = {
  showModal: () => {},
  hideModal: () => {},
  store: { props: { open: false } },
};

const noteContext = createContext<ModalContextType>(initialState);

export interface GlobalModalProps {
  children?: React.ReactNode;
}

const GlobalModal: React.FC<GlobalModalProps> = ({ children }) => {
  const [store, setStore] = useState<ModalStore | undefined>();

  const showModal = (modalProps?: Record<string, unknown>) => {
    setStore((prev) => ({
      ...prev,
      props: { ...modalProps, open: true },
    }));
  };

  const hideModal = (modalProps?: Record<string, unknown>) => {
    setStore((prev) => ({
      ...prev,
      props: { ...modalProps, open: false },
    }));
  };

  const renderComponent = () => {
    if (!store) {
      return null;
    }
    return <NoteModal />;
  };

  return (
    <noteContext.Provider value={{ store, showModal, hideModal }}>
      {renderComponent()}
      {children}
    </noteContext.Provider>
  );
};

export default GlobalModal;

export const useNotesModalContext = () => useContext(noteContext);
