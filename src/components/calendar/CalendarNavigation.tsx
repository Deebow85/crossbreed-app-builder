
import { Button } from "@/components/ui/button";
import { CalendarDays, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CalendarNavigation = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t py-4">
      <div className="container max-w-md mx-auto flex items-center justify-between px-4">
        <Button variant="ghost" size="icon" className="hover:bg-accent">
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
  );
};
