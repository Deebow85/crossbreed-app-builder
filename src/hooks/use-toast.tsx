
import * as React from "react";
import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";

// Create a type for the toast options using Parameters utility type
export type ToastProps = React.ReactNode;
export type ToastOptions = Parameters<typeof sonnerToast>[1];

type ToasterState = {
  toasts: ToastProps[];
};

const ToasterContext = React.createContext<{
  toasts: ToastProps[];
  addToast: (toast: ToastProps, options?: ToastOptions) => void;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
  removeAllToasts: () => {},
});

function useToaster() {
  const context = React.useContext(ToasterContext);
  if (!context) {
    throw new Error("useToaster must be used within a ToasterProvider");
  }
  return context;
}

export function ToasterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<ToasterState>({
    toasts: [],
  });

  const { toasts } = state;

  const addToast = React.useCallback(
    (toast: ToastProps, options?: ToastOptions) => {
      setState((prevState) => ({
        ...prevState,
        toasts: [toast, ...prevState.toasts],
      }));
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setState((prevState) => ({
      ...prevState,
      toasts: prevState.toasts.filter((toast: any) => toast.id !== id),
    }));
  }, []);

  const removeAllToasts = React.useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      toasts: [],
    }));
  }, []);

  const value = React.useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      removeAllToasts,
    }),
    [toasts, addToast, removeToast, removeAllToasts]
  );

  return (
    <ToasterContext.Provider value={value}>
      {children}
    </ToasterContext.Provider>
  );
}

// Adapt our toast function to use sonner's toast under the hood
export function toast(message: React.ReactNode, options?: ToastOptions) {
  return sonnerToast(message, options);
}

export const useToast = () => {
  const { toasts, addToast, removeToast, removeAllToasts } = useToaster();

  return {
    toast,
    toasts,
    dismiss: removeToast,
    dismissAll: removeAllToasts,
  };
};
