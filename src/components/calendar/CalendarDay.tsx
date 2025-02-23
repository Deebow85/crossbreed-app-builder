
import { cn } from "@/lib/utils";
import { ShiftType } from "@/types/calendar";
import { StickyNote, Bell } from "lucide-react";
import { format, isToday, isSameMonth } from "date-fns";
import { Button } from "@/components/ui/button";

interface CalendarDayProps {
  date: Date;
  currentMonth: Date;
  shift?: {
    date: string;
    shiftType: ShiftType;
  };
  note?: boolean;
  alarm?: boolean;
  theme: string;
  isPay: boolean;
  calendarSize: 'default' | 'large' | 'small';
  onClick: (date: Date) => void;
  onMouseDown: (date: Date) => void;
  onMouseUp: (date: Date) => void;
}

export const CalendarDay = ({
  date,
  currentMonth,
  shift,
  note,
  alarm,
  theme,
  isPay,
  calendarSize,
  onClick,
  onMouseDown,
  onMouseUp
}: CalendarDayProps) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "p-0 w-full relative hover:bg-accent transition-colors flex items-center justify-center",
        calendarSize === 'large' ? "h-20 sm:h-24" : "h-10 sm:h-12",
        !isSameMonth(date, currentMonth) && "opacity-30",
        isToday(date) && !shift && "bg-accent",
        theme === 'dark' && !shift && "hover:bg-accent/50 data-[state=open]:bg-accent/50"
      )}
      style={shift ? {
        background: shift.shiftType.gradient,
        color: theme === 'dark' ? 'white' : 'inherit'
      } : undefined}
      onClick={() => onClick(date)}
      onMouseDown={() => onMouseDown(date)}
      onMouseUp={() => onMouseUp(date)}
      onContextMenu={(e) => {
        e.preventDefault();
        onClick(date);
      }}
    >
      <span className={cn(
        "absolute top-0.5 left-1",
        calendarSize === 'large' ? "text-base sm:text-lg" : "text-[10px] sm:text-xs",
        theme === 'dark' && "text-foreground"
      )}>
        {format(date, 'd')}
      </span>
      
      {isPay && (
        <span 
          className={cn(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold",
            calendarSize === 'large' ? "text-2xl sm:text-3xl" : "text-base sm:text-lg"
          )}
          style={{ color: shift ? 'white' : theme === 'dark' ? '#F97316' : '#F97316' }}
        >
          £
        </span>
      )}
      
      {note && (
        <StickyNote 
          className={cn(
            "absolute bottom-0.5 left-0.5",
            calendarSize === 'large' ? "h-5 w-5 sm:h-6 sm:w-6" : "h-2.5 w-2.5 sm:h-3 sm:w-3"
          )}
          style={{ color: shift ? 'white' : theme === 'dark' ? '#F97316' : '#F97316' }}
        />
      )}
      
      {alarm && (
        <Bell 
          className={cn(
            "absolute bottom-0.5 right-0.5",
            calendarSize === 'large' ? "h-5 w-5 sm:h-6 sm:w-6" : "h-2.5 w-2.5 sm:h-3 sm:w-3"
          )}
          style={{ color: shift ? 'white' : theme === 'dark' ? '#F97316' : '#F97316' }}
        />
      )}
      
      {shift && (
        <span className={cn(
          "absolute bottom-0.5 font-medium",
          calendarSize === 'large' ? "text-sm sm:text-base" : "text-[8px] sm:text-xs",
          theme === 'dark' && "text-foreground"
        )}>
          {shift.shiftType.name}
        </span>
      )}
    </Button>
  );
};
