"use client";

import { X } from "lucide-react";

type IconCloseButtonProps = {
  onClick: () => void;
  className?: string;
  label?: string;
};

/** Shared Lucide close control for modals. */
export default function IconCloseButton({
  onClick,
  className = "modal-close",
  label = "Close",
}: IconCloseButtonProps) {
  return (
    <button type="button" className={className} onClick={onClick} aria-label={label}>
      <X size={18} strokeWidth={1.75} aria-hidden />
    </button>
  );
}
