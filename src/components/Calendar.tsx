
import React, { useState, useEffect } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  isSameDay,
} from "date-fns";
import CalendarDay from "./CalendarDay";
import { useTheme } from "@/lib/theme";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ShiftAssignment, ShiftType, Note, Alarm } from "@/types/calendar";
import { getAllNotes, getNoteByDate } from "@/services/noteService";

type CalendarProps = {
  currentDate: Date;
  shifts?: ShiftAssignment[];
  paydays?: string[];
  notes?: Note[];
  alarms?: Alarm[];
  onDayClick?: (date: Date) => void;
  onDayLongPress?: (date: Date) => void;
  onDayContextMenu?: (e: React.MouseEvent, date: Date) => void;
  calendarSize?: 'default' | 'large' | 'small';
  showWeekends?: boolean;
  highlightToday?: boolean;
  selectedDate?: Date | null;
  paydaySymbol?: string;
  paydayColor?: string;
  numberLayout?: string;
  startOfWeekDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

const Calendar = ({
  currentDate = new Date(),
  shifts = [],
  paydays = [],
  alarms = [],
  onDayClick = () => {},
  onDayLongPress = () => {},
  onDayContextMenu = () => {},
  calendarSize = 'default',
  showWeekends = true,
  highlightToday = true,
  selectedDate = null,
  paydaySymbol = "$",
  paydayColor = "#22c55e",
  numberLayout = "top-left",
  startOfWeekDay = 0,
}: CalendarProps) => {
  const { theme } = useTheme();
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [dateNotes, setDateNotes] = useState<Record<string, Note>>({});

  // Calculate days for the current month view
  useEffect(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: startOfWeekDay });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: startOfWeekDay });

    const dayArray = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    setCalendarDays(dayArray);
  }, [currentDate, startOfWeekDay]);

  // Load notes
  useEffect(() => {
    const allNotes = getAllNotes();
    const notesMap: Record<string, Note> = {};
    
    allNotes.forEach(note => {
      notesMap[note.date] = note;
    });
    
    setDateNotes(notesMap);
  }, [currentDate]);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // Reorder day names based on the start of week
  const orderedDayNames = [
    ...dayNames.slice(startOfWeekDay),
    ...dayNames.slice(0, startOfWeekDay),
  ];

  const weekendIndexes = showWeekends
    ? []
    : [0, 6].map((i) => (i + (7 - startOfWeekDay)) % 7);

  // Gets a shift for a specific date
  const getShiftForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return shifts.find((shift) => shift.date === dateStr);
  };

  // Check if a date is a payday
  const isPayday = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return paydays.includes(dateStr);
  };

  // Get note for a date
  const getNoteForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return dateNotes[dateStr];
  };

  // Get alarm for a date
  const getAlarmForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return alarms.find((alarm) => alarm.date === dateStr);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {orderedDayNames.map((day, i) => (
          <div
            key={day}
            className={`text-center text-xs sm:text-sm font-medium ${
              weekendIndexes.includes(i) ? "opacity-50" : ""
            }`}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const shift = getShiftForDate(day);
          const isPay = isPayday(day);
          const note = getNoteForDate(day);
          const alarm = getAlarmForDate(day);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

          return (
            <CalendarDay
              key={day.toISOString()}
              date={day}
              currentDate={currentDate}
              shift={shift}
              isPay={isPay}
              note={note}
              alarm={alarm}
              paydaySymbol={paydaySymbol}
              paydayColor={paydayColor}
              calendarSize={calendarSize}
              numberLayout={numberLayout}
              onDayClick={onDayClick}
              onLongPress={onDayLongPress}
              onContextMenu={onDayContextMenu}
              isSelected={isSelected}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
