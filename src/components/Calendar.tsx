
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Banknote } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays, startOfWeek, endOfWeek, addDays, getDay, addWeeks, lastDayOfMonth } from "date-fns";
import { LocalNotifications } from '@capacitor/local-notifications';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { CalendarNavigation } from "./calendar/CalendarNavigation";
import { CalendarGrid } from "./calendar/CalendarGrid";
import { ShiftType, ShiftAssignment } from "@/types/calendar";
import { generatePattern } from "@/utils/patternGenerator";

const shiftTypes: ShiftType[] = [];

const Calendar = () => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType | null>(null);
  const [shifts, setShifts] = useState<ShiftAssignment[]>(() => {
    const savedShifts = localStorage.getItem('calendarShifts');
    return savedShifts ? JSON.parse(savedShifts) : [];
  });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ date: string; text: string; }[]>([]);
  const [alarms, setAlarms] = useState<{ date: string; }[]>([]);
  const [calendarSize, setCalendarSize] = useState<'default' | 'large' | 'small'>('default');

  useEffect(() => {
    localStorage.setItem('calendarShifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setCalendarSize(settings.calendarSize || 'small');
      }
    };

    loadSettings();
    window.addEventListener('storage', loadSettings);
    return () => window.removeEventListener('storage', loadSettings);
  }, []);

  useEffect(() => {
    const handlePatternGeneration = () => {
      const state = JSON.parse(sessionStorage.getItem('patternData') || 'null');
      if (state?.pattern && state?.startDate) {
        const pattern = state.pattern;
        const startDate = new Date(state.startDate + 'T00:00:00');
        const yearsToGenerate = Math.min(Math.max(state.years || 1, 0), 10);

        if (isNaN(startDate.getTime())) {
          console.error('Invalid start date:', state.startDate);
          return;
        }

        try {
          const newShifts = generatePattern(pattern, startDate, yearsToGenerate);
          
          setShifts(prevShifts => {
            const patternEndDate = addDays(startDate, yearsToGenerate * 365);
            const filteredPrevShifts = prevShifts.filter(shift => {
              const shiftDate = new Date(shift.date);
              return shiftDate < startDate || shiftDate >= patternEndDate;
            });
            return [...filteredPrevShifts, ...newShifts];
          });
          
          setCurrentDate(startDate);
          sessionStorage.removeItem('patternData');
        } catch (error) {
          console.error('Error generating pattern:', error);
        }
      }
    };

    handlePatternGeneration();
  }, []);

  const getNextPayday = () => {
    const savedSettings = localStorage.getItem('appSettings');
    if (!savedSettings) return new Date();

    const settings = JSON.parse(savedSettings);
    const today = new Date();
    let nextPayday: Date;

    switch (settings.paydayType) {
      case 'weekly':
        nextPayday = new Date(today);
        const targetDay = settings.paydayDate;
        const currentDay = getDay(today);
        const daysToAdd = (targetDay + (currentDay === 0 ? 7 : -currentDay)) % 7;
        nextPayday = addDays(nextPayday, daysToAdd);
        if (daysToAdd <= 0) {
          nextPayday = addDays(nextPayday, 7);
        }
        break;

      case 'fortnightly':
        nextPayday = new Date(today);
        const targetDay2 = settings.paydayDate;
        const currentDay2 = getDay(today);
        const daysToAdd2 = (targetDay2 + (currentDay2 === 0 ? 7 : -currentDay2)) % 7;
        nextPayday = addDays(nextPayday, daysToAdd2);
        if (daysToAdd2 <= 0) {
          nextPayday = addDays(nextPayday, 7);
        }
        if (Math.floor(differenceInDays(nextPayday, startOfMonth(today)) / 14) % 2 === 0) {
          nextPayday = addWeeks(nextPayday, 1);
        }
        break;

      case 'monthly':
      case 'set-day':
        nextPayday = new Date(today.getFullYear(), today.getMonth(), settings.paydayDate);
        if (today.getDate() > settings.paydayDate) {
          nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, settings.paydayDate);
        }
        break;

      case 'first-day':
        nextPayday = new Date(today.getFullYear(), today.getMonth(), 1);
        if (today.getDate() > 1) {
          nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        }
        break;

      case 'last-day':
        nextPayday = lastDayOfMonth(today);
        if (today.getDate() === lastDayOfMonth(today).getDate()) {
          nextPayday = lastDayOfMonth(addMonths(today, 1));
        }
        break;

      case 'custom':
      default:
        nextPayday = new Date(today.getFullYear(), today.getMonth(), settings.paydayDate);
        if (today.getDate() > settings.paydayDate) {
          nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, settings.paydayDate);
        }
        break;
    }
    
    return nextPayday;
  };

  const getDaysUntilPayday = () => {
    const today = new Date();
    const nextPayday = getNextPayday();
    return differenceInDays(nextPayday, today);
  };

  const isPayday = (date: Date): boolean => {
    const savedSettings = localStorage.getItem('appSettings');
    if (!savedSettings) return false;

    const settings = JSON.parse(savedSettings);
    
    switch (settings.paydayType) {
      case 'weekly':
        return getDay(date) === settings.paydayDate;

      case 'fortnightly': {
        if (getDay(date) !== settings.paydayDate) return false;
        const monthStart = startOfMonth(date);
        const weeksSinceStart = Math.floor(differenceInDays(date, monthStart) / 7);
        return weeksSinceStart % 2 === 0;
      }

      case 'monthly':
      case 'set-day':
      case 'custom':
        return date.getDate() === settings.paydayDate;

      case 'first-day':
        return date.getDate() === 1;

      case 'last-day':
        return date.getDate() === lastDayOfMonth(date).getDate();

      default:
        return false;
    }
  };

  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString();
    const shift = shifts.find(s => s.date === dateStr);
    
    if (shift && selectedShiftType) {
      setShifts(shifts.filter(s => s.date !== dateStr));
    } else if (selectedShiftType) {
      setShifts([...shifts, { date: dateStr, shiftType: selectedShiftType }]);
    }
  };

  const handleDayMouseDown = (date: Date) => {
    setIsSelecting(true);
    setSelectionStart(date.toISOString());
  };

  const handleDayMouseUp = (date: Date) => {
    if (selectionStart && isSelecting && selectedShiftType) {
      const startDate = new Date(selectionStart);
      const endDate = date;
      
      const [finalStart, finalEnd] = startDate < endDate 
        ? [startDate, endDate] 
        : [endDate, startDate];

      const dateRange = eachDayOfInterval({ start: finalStart, end: finalEnd });
      
      const newShifts = dateRange.map(date => ({
        date: date.toISOString(),
        shiftType: selectedShiftType
      }));

      const filteredShifts = shifts.filter(shift => 
        !newShifts.some(newShift => newShift.date === shift.date)
      );

      setShifts([...filteredShifts, ...newShifts]);
    }
    
    setIsSelecting(false);
    setSelectionStart(null);
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      <Card className="w-full mx-auto px-2 sm:px-4 py-4 flex-1">
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

        <CalendarGrid
          currentDate={currentDate}
          shifts={shifts}
          notes={notes}
          alarms={alarms}
          theme={theme}
          calendarSize={calendarSize}
          isPayday={isPayday}
          onDayClick={handleDayClick}
          onDayMouseDown={handleDayMouseDown}
          onDayMouseUp={handleDayMouseUp}
        />
      </Card>
      <CalendarNavigation />
    </div>
  );
};

export default Calendar;
