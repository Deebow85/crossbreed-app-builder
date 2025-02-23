
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ShiftSetup = () => {
  const navigate = useNavigate();

  return (
    <div className="h-dvh flex flex-col p-2 sm:p-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold">Shift Setup</h1>
      </div>

      <Card className="flex-1 overflow-auto mb-20">
        <div className="p-2 sm:p-4 space-y-3">
          <h2 className="text-lg font-semibold">Configure Your Shifts</h2>
          {/* Initial placeholder content - to be expanded based on requirements */}
          <p className="text-muted-foreground">Configure your shift types, patterns, and preferences here.</p>
        </div>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t py-4">
        <div className="container max-w-md mx-auto flex items-center justify-between px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-accent"
            onClick={() => navigate("/")}
          >
            <CalendarDays className="h-8 w-8" />
          </Button>
          
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-semibold text-xl">S</span>
            </div>
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
    </div>
  );
};

export default ShiftSetup;
