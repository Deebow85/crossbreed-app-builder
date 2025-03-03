
import { Toaster as SonnerToaster } from "sonner"
import { cn } from "@/lib/utils"

export function Toaster() {
  return (
    <SonnerToaster
      className={cn("toaster group")}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toaster]:text-muted-foreground",
          actionButton: "group-[.toaster]:bg-primary group-[.toaster]:text-primary-foreground",
          cancelButton: "group-[.toaster]:bg-muted group-[.toaster]:text-muted-foreground",
        }
      }}
    />
  )
}
