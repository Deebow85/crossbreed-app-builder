import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const NotesTracking = () => {
  const [activeTab, setActiveTab] = useState("notes");
  const location = useLocation();
  
  useEffect(() => {
    // Check if we have state indicating we should open the shift swap tab
    if (location.state?.openShiftSwap) {
      setActiveTab("shift-swaps");
    }
  }, [location.state]);

  return (
    <div className="container py-4 space-y-4">
      <h1 className="text-2xl font-bold">Notes & Tracking</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="shift-swaps">Shift Swaps</TabsTrigger>
          <TabsTrigger value="toil">TOIL</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[calc(100vh-250px)] mt-4">
          <TabsContent value="notes" className="space-y-4">
            <div className="p-4 border rounded-lg">
              <p className="text-muted-foreground">Your notes will appear here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="shift-swaps" className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Shift Swaps</h2>
              <p className="text-muted-foreground">Record and track shift swaps with coworkers.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="toil" className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Time Off In Lieu (TOIL)</h2>
              <p className="text-muted-foreground">Track your TOIL hours here.</p>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default NotesTracking;
