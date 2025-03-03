
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

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
            <Card>
              <CardHeader>
                <CardTitle>Shift Swaps</CardTitle>
                <CardDescription>Record and track shift swaps with coworkers.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Record New Shift Swap
                  </Button>
                  
                  <div className="border rounded-md p-4 bg-muted/20">
                    <p className="text-sm text-muted-foreground text-center">
                      No shift swaps recorded yet.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="toil" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Time Off In Lieu (TOIL)</CardTitle>
                <CardDescription>Track your TOIL hours here.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Record New TOIL
                  </Button>
                  
                  <div className="border rounded-md p-4 bg-muted/20">
                    <p className="text-sm text-muted-foreground text-center">
                      No TOIL hours recorded yet.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default NotesTracking;
