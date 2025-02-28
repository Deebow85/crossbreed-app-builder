
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme";
import { ToasterProvider } from "@/hooks/use-toast";
import { Suspense, useState, useEffect } from "react";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import ShiftSetup from "./pages/ShiftSetup";
import NotesTracking from "./pages/NotesTracking";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";

// Create a new QueryClient with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error("Query error:", error);
      },
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error("Mutation error:", error);
      },
    },
  },
});

// Simple error boundary component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <p className="mb-4 text-muted-foreground">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
};

// Custom error boundary implementation (since React's ErrorBoundary is class-based)
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Add global error handler
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      setError(event.error);
      event.preventDefault();
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  const resetErrorBoundary = () => {
    setError(null);
  };

  if (error) {
    return <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />;
  }

  return <>{children}</>;
};

// Wrap each route in loading and error handling
const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        {element}
      </Suspense>
    </ErrorBoundary>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <ToasterProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<ProtectedRoute element={<Index />} />} />
                <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
                <Route path="/shift-setup" element={<ProtectedRoute element={<ShiftSetup />} />} />
                <Route path="/notes-tracking" element={<ProtectedRoute element={<NotesTracking />} />} />
                <Route path="*" element={<ProtectedRoute element={<NotFound />} />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ToasterProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
