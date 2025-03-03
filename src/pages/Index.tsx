
import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";
import { useOutletContext } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ContextType = { isSelectingMultiple: boolean };

/**
 * Main Index page component that displays the calendar and a tutorial dialog
 * on first visit. Notes created here are saved to localStorage and can be viewed
 * in the notes tracking page.
 */
const Index = () => {
  const { isSelectingMultiple } = useOutletContext<ContextType>();
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Show the tutorial dialog on first visit
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

  // Set up a listener for notes updates
  useEffect(() => {
    const handleNotesUpdated = () => {
      // This component just needs to know updates happened
      // but doesn't need to take action
      console.log("Notes were updated");
    };

    // Add event listener for notes updates
    document.addEventListener('notesUpdated', handleNotesUpdated);
    
    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener('notesUpdated', handleNotesUpdated);
    };
  }, []);

  return (
    <>
      <Calendar isSelectingMultiple={isSelectingMultiple} />

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
              <p>Right-click on any day to add notes. Notes will be saved and accessible in the Notes Tracking section.</p>
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
    </>
  );
};

export default Index;
