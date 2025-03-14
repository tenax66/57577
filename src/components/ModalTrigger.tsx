// https://github.com/internet-development/www-sacred

'use client';

import * as React from 'react';

import { useModals } from './page/ModalContext';

interface ModalTriggerProps {
  children: React.ReactElement<{ onClick?: React.MouseEventHandler }>;
  modal: React.ComponentType<any>;
  modalProps?: Record<string, any>;
}

function ModalTrigger({ children, modal, modalProps = {} }: ModalTriggerProps) {
  const { open } = useModals();

  const onHandleOpenModal = () => {
    open(modal, modalProps);
  };

  return React.cloneElement(children, {
    onClick: onHandleOpenModal,
  });
}

export default ModalTrigger;
