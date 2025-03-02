
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme";
import { ToasterProvider } from "@/hooks/use-toast";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import ShiftSetup from "./pages/ShiftSetup";
import NotesTracking from "./pages/NotesTracking";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Custom Toast Event Listener Component
const ToastEventListener = () => {
  const { toast, dismiss } = useToast();
  
  useEffect(() => {
    const handleToast = (event: CustomEvent<any>) => {
      toast(event.detail);
    };
    
    const handleToastDismiss = (event: CustomEvent<any>) => {
      dismiss(event.detail.id);
    };
    
    const handleToastUpdate = (event: CustomEvent<any>) => {
      const { id, ...props } = event.detail;
      toast({ id, ...props });
    };
    
    document.addEventListener('toast' as any, handleToast as EventListener);
    document.addEventListener('toast-dismiss' as any, handleToastDismiss as EventListener);
    document.addEventListener('toast-update' as any, handleToastUpdate as EventListener);
    
    return () => {
      document.removeEventListener('toast' as any, handleToast as EventListener);
      document.removeEventListener('toast-dismiss' as any, handleToastDismiss as EventListener);
      document.removeEventListener('toast-update' as any, handleToastUpdate as EventListener);
    };
  }, [toast, dismiss]);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <ToasterProvider>
        <TooltipProvider>
          <ToastEventListener />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/shift-setup" element={<ShiftSetup />} />
                <Route path="/notes-tracking" element={<NotesTracking />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ToasterProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
