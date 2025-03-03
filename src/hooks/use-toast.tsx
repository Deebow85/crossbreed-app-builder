
import * as React from "react"
import {
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
      // Toast functionality disabled - do nothing
    },
    []
  )

  const removeToast = React.useCallback((id: string) => {
    // Toast functionality disabled - do nothing
  }, [])

  const removeAllToasts = React.useCallback(() => {
    // Toast functionality disabled - do nothing
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

// Stub for the toast function - does nothing
export const toast = (props: ToastProps) => {
  // Toast functionality disabled - do nothing
  return {
    id: crypto.randomUUID(),
    dismiss: () => {},
    update: () => {},
  }
}

// Stub for the useToast hook - returns empty functions
export const useToast = () => {
  return {
    toast: (props: ToastProps) => {
      // Toast functionality disabled - do nothing
      return {
        id: crypto.randomUUID(),
        dismiss: () => {},
        update: () => {},
      }
    },
    toasts: [],
    dismiss: () => {},
    dismissAll: () => {},
  }
}
