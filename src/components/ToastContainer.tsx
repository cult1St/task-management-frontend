"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X, type LucideIcon } from "lucide-react";
import { ToastItem } from "@/hooks/useToast";

const toastIcon: Record<ToastItem["type"], LucideIcon> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export default function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="toast-container" id="toastContainer" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = toastIcon[toast.type];
        return (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <Icon className="toast-icon" size={18} strokeWidth={1.75} aria-hidden />
            <span className="toast-text">{toast.message}</span>
            <button
              className="btn btn-icon"
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss toast"
            >
              <X size={16} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
