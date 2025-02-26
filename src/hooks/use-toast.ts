
import * as React from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  type ToastProps,
  type ToastActionElement,
} from "@/components/ui/toast"

export type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000

type ToasterState = {
  toasts: ToasterToast[]
}

const toaster = React.createContext<{
  toasts: ToasterToast[]
  addToast: (toast: ToasterToast) => void
  removeToast: (id: string) => void
  removeAllToasts: () => void
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
  removeAllToasts: () => {},
})

function useToaster() {
  const context = React.useContext(toaster)
  if (!context) {
    throw new Error("useToaster must be used within a ToasterProvider")
  }
  return context
}

export function ToasterProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [state, setState] = React.useState<ToasterState>({
    toasts: [],
  })

  const { toasts } = state

  const addToast = React.useCallback(
    (toast: ToasterToast) => {
      setState((prevState) => {
        const newToasts = [toast, ...prevState.toasts].slice(0, TOAST_LIMIT)
        return {
          ...prevState,
          toasts: newToasts,
        }
      })
    },
    []
  )

  const removeToast = React.useCallback((id: string) => {
    setState((prevState) => ({
      ...prevState,
      toasts: prevState.toasts.filter((toast) => toast.id !== id),
    }))
  }, [])

  const removeAllToasts = React.useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      toasts: [],
    }))
  }, [])

  const value = React.useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      removeAllToasts,
    }),
    [toasts, addToast, removeToast, removeAllToasts]
  )

  return (
    <toaster.Provider value={value}>
      {children}
    </toaster.Provider>
  )
}

export const useToast = () => {
  const { toasts, addToast, removeToast, removeAllToasts } = useToaster()

  const toast = React.useCallback(
    (props: ToastProps) => {
      const id = crypto.randomUUID()
      const toastProps = { id, ...props } as ToasterToast
      addToast(toastProps)
      
      return {
        id,
        dismiss: () => removeToast(id),
        update: (props: ToastProps) => {
          addToast({ id, ...props } as ToasterToast)
        },
      }
    },
    [addToast, removeToast]
  )

  return {
    toast,
    toasts,
    dismiss: removeToast,
    dismissAll: removeAllToasts,
  }
}

export { toast } from "./toast"
