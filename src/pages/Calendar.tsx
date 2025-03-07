import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Banknote, ChevronLeft, ChevronRight, Clock, Settings } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { getNextPayday } from "@/utils/dateUtils";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { AppSettings, defaultSettings } from "@/types/settings";
import { useToast } from "@/components/ui/use-toast";
import { ComparisonCalendar } from "@/components/ComparisonCalendar";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [totalOvertimeHours, setTotalOvertimeHours] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      const settings = {
        ...defaultSettings,
        ...parsed,
        overtime: {
          ...defaultSettings.overtime,
          ...parsed.overtime,
          schedule: {
            ...defaultSettings.overtime.schedule,
            ...(parsed.overtime?.schedule || {})
          }
        }
      };
      setSettings(settings);
    }
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setIsPopoverOpen(true);
  };

  const handleNextMonth = () => {
    setCurrentDate(addDays(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1), -1));
  };

  const handlePrevMonth = () => {
    setCurrentDate(addDays(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1), -1));
  };

  return (
    <div className="relative flex flex-col min-h-screen pb-20">
      <Card className="w-full mx-auto px-2 sm:px-4 py-4 flex-1">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="text-center flex-1 mx-4">
            <div className="flex items-center justify-center mb-2">
              <h2 className="text-lg sm:text-xl font-bold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                {settings?.paydayEnabled && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Banknote className="h-4 w-4" />
                        <span>
                          {differenceInDays(getNextPayday(settings) || new Date(), new Date()) + 1} days until payday
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Next payday: {format(getNextPayday(settings) || new Date(), 'MMM do')}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {settings?.overtime?.enabled && (
                  <div className="-mt-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{totalOvertimeHours} hours overtime</span>
                        </TooltipTrigger>
                        <TooltipContent>Total overtime hours this pay period</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <ComparisonCalendar
          currentDate={currentDate}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
      </Card>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t py-4">
        <div className="container max-w-md mx-auto flex items-center justify-between px-4">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent"
            onClick={() => navigate("/")}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

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
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
