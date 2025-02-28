
import { toast } from "@/components/ui/use-toast";

/**
 * A wrapper function that safely executes a callback and catches any errors
 * @param callback The function to execute
 * @param errorMessage An optional custom error message to display
 * @returns The result of the callback, or void if an error occurred
 */
export function safeExecute<T>(
  callback: () => T,
  errorMessage = "An error occurred. Please try again."
): T | void {
  try {
    return callback();
  } catch (error) {
    console.error("Error in safeExecute:", error);
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  }
}

/**
 * A wrapper function for async callbacks that handles errors
 * @param callback The async function to execute
 * @param errorMessage An optional custom error message to display
 * @returns A promise that resolves to the result of the callback, or void if an error occurred
 */
export async function safeExecuteAsync<T>(
  callback: () => Promise<T>,
  errorMessage = "An error occurred. Please try again."
): Promise<T | void> {
  try {
    return await callback();
  } catch (error) {
    console.error("Error in safeExecuteAsync:", error);
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  }
}

/**
 * Global error handler to be used with window.addEventListener
 */
export function setupGlobalErrorHandling(): () => void {
  const handleError = (event: ErrorEvent) => {
    console.error("Uncaught error:", event.error);
    toast({
      title: "Unexpected Error",
      description: "An unexpected error occurred. Please try refreshing the page.",
      variant: "destructive",
    });
    event.preventDefault();
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error("Unhandled promise rejection:", event.reason);
    toast({
      title: "Unexpected Error",
      description: "An unexpected error occurred. Please try refreshing the page.",
      variant: "destructive",
    });
    event.preventDefault();
  };

  window.addEventListener("error", handleError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);

  // Return a cleanup function
  return () => {
    window.removeEventListener("error", handleError);
    window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  };
}
