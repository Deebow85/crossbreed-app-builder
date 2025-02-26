
import { type ToastProps } from "@/components/ui/toast"
import { useToast as useToastHook } from "./use-toast"

export function toast(props: ToastProps) {
  const { toast } = useToastHook()
  return toast(props)
}
