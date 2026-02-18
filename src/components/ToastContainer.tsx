"use client";

import { ToastItem } from "@/hooks/useToast";

const toastIcon: Record<ToastItem["type"], string> = {
  success: "✓",
  error: "!",
  info: "i",
};

export default function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="toast-container" id="toastContainer">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <span className="toast-icon">{toastIcon[toast.type]}</span>
          <span className="toast-text">{toast.message}</span>
          <button
            className="btn btn-icon"
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss toast"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
