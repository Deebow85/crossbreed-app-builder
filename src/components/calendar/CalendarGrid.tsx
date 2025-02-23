
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { CalendarDay } from "./CalendarDay";
import { ShiftType, ShiftAssignment } from "@/types/calendar";

interface CalendarGridProps {
  currentDate: Date;
  shifts: ShiftAssignment[];
  notes: { date: string; text: string; }[];
  alarms: { date: string; }[];
  theme: string;
  calendarSize: 'default' | 'large' | 'small';
  isPayday: (date: Date) => boolean;
  onDayClick: (date: Date) => void;
  onDayMouseDown: (date: Date) => void;
  onDayMouseUp: (date: Date) => void;
}

export const CalendarGrid = ({
  currentDate,
  shifts,
  notes,
  alarms,
  theme,
  calendarSize,
  isPayday,
  onDayClick,
  onDayMouseDown,
  onDayMouseUp
}: CalendarGridProps) => {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const daysToDisplay = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div 
            key={day} 
            className="text-center text-xs sm:text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysToDisplay.map((date) => {
          const shift = shifts.find(s => s.date === date.toISOString());
          const hasNote = notes.some(n => n.date === date.toISOString());
          const hasAlarm = alarms.some(a => a.date === date.toISOString());
          const isPay = isPayday(date);

          return (
            <CalendarDay
              key={date.toISOString()}
              date={date}
              currentMonth={currentDate}
              shift={shift}
              note={hasNote}
              alarm={hasAlarm}
              theme={theme}
              isPay={isPay}
              calendarSize={calendarSize}
              onClick={onDayClick}
              onMouseDown={onDayMouseDown}
              onMouseUp={onDayMouseUp}
            />
          );
        })}
      </div>
    </>
  );
};
