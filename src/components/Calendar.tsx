
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/lib/theme";
import { CalendarNavigation } from "./calendar/CalendarNavigation";
import { CalendarGrid } from "./calendar/CalendarGrid";
import { generatePattern } from "@/utils/patternGenerator";
import { useCalendarSettings } from "@/hooks/useCalendarSettings";
import { useShiftSelection } from "@/hooks/useShiftSelection";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { isPayday } from "@/utils/paydays";
import { addDays } from "date-fns";

const Calendar = () => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { calendarSize, shifts, setShifts } = useCalendarSettings();
  const { handleDayClick, handleDayMouseDown, handleDayMouseUp } = useShiftSelection(shifts, setShifts);
  const [notes, setNotes] = useState<{ date: string; text: string; }[]>([]);
  const [alarms, setAlarms] = useState<{ date: string; }[]>([]);

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
  }, [setShifts]);

  return (
    <div className="relative flex flex-col min-h-screen">
      <Card className="w-full mx-auto px-2 sm:px-4 py-4 flex-1">
        <CalendarHeader 
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />

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
