
import { format, isSameMonth, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, StickyNote } from "lucide-react";
import { ShiftAssignment, Note, Alarm } from "@/types/calendar";
import { useTheme } from "@/lib/theme";
import { useEffect, useRef } from "react";

type CalendarDayProps = {
  date: Date;
  currentDate: Date;
  shift?: ShiftAssignment;
  isPay: boolean;
  note?: Note;
  alarm?: Alarm;
  paydaySymbol: string;
  paydayColor: string;
  calendarSize: 'default' | 'large' | 'small';
  numberLayout: string;
  onDayClick: (date: Date) => void;
  onLongPress: (date: Date) => void;
  onContextMenu: (e: React.MouseEvent, date: Date) => void;
  isSelected?: boolean;
  showPayday?: boolean;
};

const CalendarDay = ({
  date,
  currentDate,
  shift,
  isPay,
  note,
  alarm,
  paydaySymbol,
  paydayColor,
  calendarSize,
  numberLayout,
  onDayClick,
  onLongPress,
  onContextMenu,
  isSelected,
  showPayday = true,
}: CalendarDayProps) => {
  const { theme } = useTheme();
  const longPressTimer = useRef<NodeJS.Timeout>();
  const isLongPress = useRef(false);

  const handleTouchStart = () => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress(date);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    if (!isLongPress.current) {
      onDayClick(date);
    }
  };

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  const numberPositionClasses = {
    'centre': 'left-1/2 -translate-x-1/2',
    'top-left': 'left-1',
    'top-right': 'right-1'
  }[numberLayout];

  // Set text color for shift name and labels based on shift type
  const textColor = 'white';

  // Determine the proper styling for special types
  const isSpecialShift = shift?.shiftType.isOvertime || 
                          shift?.shiftType.isTOIL || 
                          shift?.shiftType.isSwapDone || 
                          shift?.shiftType.isSwapOwed;

  return (
    <Button
      key={date.toISOString()}
      variant="ghost"
      className={cn(
        "p-0 w-full relative hover:bg-accent transition-colors flex items-center justify-center",
        calendarSize === 'large' ? "h-16 sm:h-20" : "h-10 sm:h-12",
        !isSameMonth(date, currentDate) && "opacity-30",
        isToday(date) && !shift && "bg-accent",
        isSelected && "ring-2 ring-primary",
        theme === 'dark' && !shift && "hover:bg-accent/50 data-[state=open]:bg-accent/50"
      )}
      style={shift ? {
        background: shift.shiftType.gradient,
        color: theme === 'dark' ? textColor : 'inherit'
      } : undefined}
      onClick={() => onDayClick(date)}
      onContextMenu={(e) => onContextMenu(e, date)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <span className={cn(
        "absolute top-0.5",
        numberPositionClasses,
        calendarSize === 'large' ? "text-base sm:text-lg" : "text-[10px] sm:text-xs",
        shift ? "text-white" : "text-foreground"
      )}>
        {format(date, 'd')}
      </span>
      {showPayday && isPay && (
        <span 
          className={cn(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold",
            calendarSize === 'large' ? "text-2xl sm:text-3xl" : "text-base sm:text-lg"
          )}
          style={{ color: shift ? textColor : paydayColor }}
        >
          {paydaySymbol}
        </span>
      )}
      {note && (
        <StickyNote 
          className={cn(
            "absolute bottom-0.5 left-0.5",
            calendarSize === 'large' ? "h-5 w-5 sm:h-6 sm:w-6" : "h-2.5 w-2.5 sm:h-3 sm:w-3"
          )}
          style={{ color: shift ? textColor : paydayColor }}
        />
      )}
      {alarm && (
        <Bell 
          className={cn(
            "absolute bottom-0.5 right-0.5",
            calendarSize === 'large' ? "h-5 w-5 sm:h-6 sm:w-6" : "h-2.5 w-2.5 sm:h-3 sm:w-3"
          )}
          style={{ color: shift ? textColor : paydayColor }}
        />
      )}
      {shift && (
        <span className={cn(
          "absolute bottom-0.5 font-medium",
          calendarSize === 'large' ? "text-sm sm:text-base" : "text-[8px] sm:text-xs",
          "text-white"
        )}>
          {shift.shiftType.name}
          {isSpecialShift && (
            <span className="ml-1 text-[0.7em] opacity-80">
              {shift.shiftType.isOvertime ? "OT" : 
               shift.shiftType.isTOIL ? "T" : 
               shift.shiftType.isSwapDone ? "SD" : 
               shift.shiftType.isSwapOwed ? "SO" : ""}
            </span>
          )}
        </span>
      )}
    </Button>
  );
};

export default CalendarDay;
