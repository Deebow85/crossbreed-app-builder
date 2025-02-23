
import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";
import { Button } from "@/components/ui/button";
import { Settings, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowTutorial(true)}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Need help? Click to view tutorial</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/settings")}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Customize app settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex-1">
        <Calendar />
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
