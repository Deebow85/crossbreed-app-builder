
import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";
import { Button } from "@/components/ui/button";
import { CalendarDays, Settings, Notebook } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Index = () => {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const completeTutorial = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    setShowTutorial(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <Calendar />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t py-4">
        <div className="container max-w-md mx-auto flex items-center justify-between px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-accent"
          >
            <CalendarDays className="h-8 w-8" />
          </Button>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="relative p-0"
              onClick={() => navigate("/shift-setup")}
            >
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-semibold text-xl">S</span>
              </div>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent"
            >
              <Notebook className="h-8 w-8" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-accent"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-8 w-8" />
          </Button>
        </div>
      </div>

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
