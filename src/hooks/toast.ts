
import { type ToastProps } from "@/components/ui/toast"
import { useToast as useToastHook } from "./use-toast"

// Note: This is a helper function that creates a global toast instance
// It's useful for creating toasts outside of React components
let toastFn: ((props: ToastProps) => { id: string; dismiss: () => void; update: (props: ToastProps) => void }) | null = null;

export function toast(props: ToastProps) {
  // If called within a component that uses useToast
  if (typeof window !== "undefined" && !toastFn) {
    // Create a singleton instance
    const { toast } = useToastHook();
    toastFn = toast;
  }
  
  if (!toastFn) {
    // This should only happen during development or SSR
    console.warn("Toast function called before being initialized");
    return { id: "", dismiss: () => {}, update: () => {} };
  }
  
  return toastFn(props);
}
