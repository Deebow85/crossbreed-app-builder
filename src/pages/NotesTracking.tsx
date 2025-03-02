import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotesDisplay from "@/components/NotesDisplay";

const NotesTracking = () => {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Notes & Tracking</h1>
      
      <Tabs defaultValue="notes">
        <TabsList className="mb-4">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="swaps">Swaps</TabsTrigger>
          <TabsTrigger value="toil">TOIL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notes">
          <NotesDisplay 
            category="notes from calendar"
            title="Calendar Notes" 
            description="Notes created from calendar days"
          />
          
          {/* Other notes sections can be added here */}
        </TabsContent>
        
        <TabsContent value="swaps">
          <div className="text-center py-10 text-muted-foreground">
            Swap tracking coming soon
          </div>
        </TabsContent>
        
        <TabsContent value="toil">
          <div className="text-center py-10 text-muted-foreground">
            TOIL tracking coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotesTracking;
