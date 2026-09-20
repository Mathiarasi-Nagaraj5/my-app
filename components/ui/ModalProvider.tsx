"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";

type ConfirmVariant = "default" | "danger";
type AlertVariant = "info" | "success" | "error";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

interface AlertOptions {
  title?: string;
  message: string;
  variant?: AlertVariant;
}

interface ModalContextValue {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  alert: (options: AlertOptions | string) => Promise<void>;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

interface PendingAlert extends AlertOptions {
  resolve: () => void;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const [pendingAlert, setPendingAlert] = useState<PendingAlert | null>(null);

  const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    const opts = typeof options === "string" ? { message: options } : options;
    return new Promise((resolve) => {
      setPendingConfirm({ ...opts, resolve });
    });
  }, []);

  const alert = useCallback((options: AlertOptions | string): Promise<void> => {
    const opts = typeof options === "string" ? { message: options } : options;
    return new Promise((resolve) => {
      setPendingAlert({ ...opts, resolve });
    });
  }, []);

  const closeConfirm = (result: boolean) => {
    pendingConfirm?.resolve(result);
    setPendingConfirm(null);
  };

  const closeAlert = () => {
    pendingAlert?.resolve();
    setPendingAlert(null);
  };

  return (
    <ModalContext.Provider value={{ confirm, alert }}>
      {children}

      {/* Confirm dialog */}
      {pendingConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-start gap-3">
              <AlertTriangle
                size={20}
                className={`mt-0.5 flex-shrink-0 ${pendingConfirm.variant === "danger" ? "text-red-500" : "text-amber-500"}`}
              />
              <div>
                {pendingConfirm.title && (
                  <p className="mb-1 text-sm font-semibold text-gray-900">{pendingConfirm.title}</p>
                )}
                <p className="text-sm text-gray-600">{pendingConfirm.message}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => closeConfirm(false)}
                className="rounded-md px-3.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
              >
                {pendingConfirm.cancelLabel ?? "Cancel"}
              </button>
              <button
                onClick={() => closeConfirm(true)}
                className={`rounded-md px-3.5 py-1.5 text-sm font-medium text-white ${
                  pendingConfirm.variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-charcoal hover:bg-charcoal/90"
                }`}
              >
                {pendingConfirm.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert dialog */}
      {pendingAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-start gap-3">
              {pendingAlert.variant === "success" ? (
                <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0 text-green-500" />
              ) : pendingAlert.variant === "error" ? (
                <AlertTriangle size={20} className="mt-0.5 flex-shrink-0 text-red-500" />
              ) : (
                <Info size={20} className="mt-0.5 flex-shrink-0 text-blue-500" />
              )}
              <div>
                {pendingAlert.title && (
                  <p className="mb-1 text-sm font-semibold text-gray-900">{pendingAlert.title}</p>
                )}
                <p className="text-sm text-gray-600">{pendingAlert.message}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeAlert}
                className="rounded-md bg-charcoal px-3.5 py-1.5 text-sm font-medium text-white hover:bg-charcoal/90"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within a ModalProvider");
  return ctx;
}