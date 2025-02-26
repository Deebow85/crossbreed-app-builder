
import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";
import { Button } from "@/components/ui/button";
import { CalendarDays, Settings, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppSettings, defaultSettings } from "@/types/settings";

const Index = () => {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const [isSelectingMultiple, setIsSelectingMultiple] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
    
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({
          ...defaultSettings,
          ...parsedSettings,
          overtime: {
            ...defaultSettings.overtime,
            ...parsedSettings.overtime,
            schedule: {
              ...defaultSettings.overtime.schedule,
              ...(parsedSettings.overtime?.schedule || {})
            }
          }
        });
      } catch (e) {
        console.error("Error parsing settings:", e);
      }
    }
  }, []);

  const completeTutorial = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    setShowTutorial(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <Calendar isSelectingMultiple={isSelectingMultiple} />
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t py-2 z-50">
        <div className="container max-w-md mx-auto flex justify-between items-center px-4">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="flex flex-col items-center justify-center h-16 w-16 rounded-none"
            >
              <CalendarDays className="h-6 w-6" />
              {settings.showIconTitles && <span className="text-xs mt-1">Calendar</span>}
            </Button>
            
            <Button
              variant={isSelectingMultiple ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setIsSelectingMultiple(!isSelectingMultiple)}
              className="flex flex-col items-center justify-center h-16 w-16 rounded-none"
            >
              <CheckSquare className="h-6 w-6" />
              {settings.showIconTitles && <span className="text-xs mt-1">Multi Select</span>}
            </Button>
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2">
            <Button
              variant="ghost"
              size="icon"
              className="flex items-center justify-center h-16 w-16 rounded-none p-0"
              onClick={() => navigate("/shift-setup")}
            >
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-semibold text-xl">S</span>
              </div>
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              className="flex flex-col items-center justify-center h-16 w-16 rounded-none"
              onClick={() => console.log("N button clicked")}
            >
              <div className="h-8 w-8 border-2 border-foreground rounded-md flex items-center justify-center">
                <span className="font-semibold text-foreground">N</span>
              </div>
              {settings.showIconTitles && <span className="text-xs mt-1">Notes</span>}
            </Button>
            
            <Button 
              variant="ghost" 
              className="flex flex-col items-center justify-center h-16 w-16 rounded-none"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-6 w-6" />
              {settings.showIconTitles && <span className="text-xs mt-1">Settings</span>}
            </Button>
          </div>
        </div>
      </nav>

      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Welcome to your Shift Calendar!</DialogTitle>
            <DialogDescription>
              Let's get you started with the key features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">📅 Adding Shifts</h4>
              <p>Click on any day to add a shift. Select the shift type from the buttons above the calendar.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">⌚ Setting Alarms</h4>
              <p>Middle-click on a shift to set an alarm. A bell icon will appear when an alarm is set.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">📝 Adding Notes</h4>
              <p>Right-click on any day to add notes or manage shift swaps.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🔄 Shift Patterns</h4>
              <p>Use the "Set Pattern" button to quickly add recurring shifts.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">💡 Pro Tips</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Click and drag to add multiple shifts at once</li>
                <li>Use the search bar to find specific notes or swaps</li>
                <li>Click the gear icon to customize the app's appearance</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={completeTutorial}>Got it, thanks!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
