"use client";

import { ReactElement } from "react";

type Props = {
    isOpen: boolean,
    onClose: () => void,
    children: ReactElement
}

export default function Modal({ isOpen, onClose, children }: Props) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
