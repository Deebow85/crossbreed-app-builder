
import * as React from "react"
import { 
  toast as sonnerToast,
  Toaster as SonnerToaster, 
  type ToastT, 
  type ToastOptions 
} from "sonner"

import { cn } from "@/lib/utils"

const ToasterContext = React.createContext<
  | {
      toast: (props: ToastProps) => void
    }
  | undefined
>(undefined)

type ToastProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
} & ToastOptions

export function ToasterProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const toast = ({ title, description, action, ...props }: ToastProps) => {
    sonnerToast(
      <div className="grid gap-1">
        {title && <p className="font-semibold">{title}</p>}
        {description && <p className="text-sm opacity-90">{description}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>,
      {
        classNames: {
          toast: cn(
            "group toast group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:border-border group-[.toast]:shadow-lg"
          ),
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
        ...props,
      }
    )
  }

  return (
    <ToasterContext.Provider value={{ toast }}>
      {children}
    </ToasterContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToasterContext)

  if (!context) {
    throw new Error("useToast must be used within a ToasterProvider")
  }

  return context
}

// Re-export toast from sonner for direct usage
export { sonnerToast as toast }
