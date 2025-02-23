
import { format, addMonths, subMonths } from "date-fns";
import { Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { getDaysUntilPayday, getNextPayday } from "@/utils/paydays";

interface CalendarHeaderProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

export const CalendarHeader = ({ currentDate, setCurrentDate }: CalendarHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              onClick={() => setCurrentDate(prev => subMonths(prev, 1))}
              className="px-3"
            >
              {format(subMonths(currentDate, 1), 'MMM')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Previous month</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="text-center">
        <div className="flex items-center gap-4">
          <h2 className="text-lg sm:text-xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex flex-col items-center gap-1 mt-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Banknote className="h-4 w-4" />
                <span>{getDaysUntilPayday()} days until payday</span>
              </TooltipTrigger>
              <TooltipContent>Next payday: {format(getNextPayday(), 'MMM do')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline"
              onClick={() => setCurrentDate(prev => addMonths(prev, 1))}
              className="px-3"
            >
              {format(addMonths(currentDate, 1), 'MMM')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Next month</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
