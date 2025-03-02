
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
import CalendarNotes from "./pages/CalendarNotes";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

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
                <Route path="/" element={<Index />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/shift-setup" element={<ShiftSetup />} />
                <Route path="/notes-tracking" element={<NotesTracking />} />
                <Route path="/calendar-notes" element={<CalendarNotes />} />
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
