
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

const ToasterContext = React.createContext<{
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
  const context = React.useContext(ToasterContext)
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
    <ToasterContext.Provider value={value}>
      {children}
    </ToasterContext.Provider>
  )
}

export function toast({
  title,
  description,
  ...props
}: Omit<ToasterToast, "id">) {
  const id = crypto.randomUUID()
  const { addToast, removeToast } = useToaster()
  
  const toastProps = { id, title, description, ...props } as ToasterToast
  addToast(toastProps)
  
  return {
    id,
    dismiss: () => removeToast(id),
    update: (props: Omit<ToasterToast, "id">) => {
      addToast({ id, ...props } as ToasterToast)
    },
  }
}

export const useToast = () => {
  const { toasts, addToast, removeToast, removeAllToasts } = useToaster()

  return {
    toast,
    toasts,
    dismiss: removeToast,
    dismissAll: removeAllToasts,
  }
}
