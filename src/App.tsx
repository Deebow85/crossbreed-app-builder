
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import Calendar from '@/components/Calendar';
import './App.css';

function App() {
  return (
    <Router>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Calendar />
        <Toaster />
      </ThemeProvider>
    </Router>
  );
}

export default App;
