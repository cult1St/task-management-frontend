"use client";

import { ReactElement } from "react";
import IconCloseButton from "@/components/IconCloseButton";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactElement;
};

export default function Modal({ isOpen, onClose, children }: Props) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <IconCloseButton onClick={onClose} />
        {children}
      </div>
    </div>
  );
}
