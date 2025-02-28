
import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShiftAssignment, ShiftType, Note } from "@/types/calendar";
import NoteEditDialog from "@/components/NoteEditDialog";
import { useToast } from "@/components/ui/use-toast";
import { getAllNotes, getNoteByDate, saveNote, deleteNote } from "@/services/noteService";

interface CalendarProps {
  shifts?: ShiftAssignment[];
  onDateClick?: (date: Date) => void;
  isSelectingMultiple?: boolean;
  selectedDates?: Date[];
  onDateSelect?: (date: Date) => void;
  highlightedDates?: Date[];
  highlightColor?: string;
}

const Calendar = ({ 
  shifts = [], 
  onDateClick,
  isSelectingMultiple = false,
  selectedDates = [],
  onDateSelect,
  highlightedDates = [],
  highlightColor = "bg-blue-100"
}: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    loadNotes();
  }, []);
  
  const loadNotes = () => {
    const allNotes = getAllNotes();
    setNotes(allNotes);
  };

  const handleSaveNote = (note: Note) => {
    saveNote(note);
    loadNotes(); // Reload notes to get the updated list
    
    toast({
      title: "Note saved",
      description: "Your note has been saved to the calendar."
    });
  };

  const handleDeleteNote = (dateStr: string) => {
    deleteNote(dateStr);
    loadNotes(); // Reload notes to get the updated list
    
    toast({
      title: "Note deleted",
      description: "The note has been removed."
    });
  };

  const getNote = (date: Date): Note | undefined => {
    const dateStr = date.toISOString();
    return getNoteByDate(dateStr);
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const onDateClickHandler = (day: Date) => {
    if (isSelectingMultiple) {
      if (onDateSelect) {
        onDateSelect(day);
      }
      return;
    }
    
    setSelectedDate(day);
    if (onDateClick) {
      onDateClick(day);
    }
  };

  const onNoteClick = (day: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(day);
    setIsNoteDialogOpen(true);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Create a 7x6 grid for the calendar
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = monthStart.getDay();
    const daysInMonth = monthDays.length;
    
    // Create a 7x6 grid (42 cells)
    const totalCells = 42;
    const days: (Date | null)[] = Array(totalCells).fill(null);
    
    // Fill in the days of the month
    for (let i = 0; i < daysInMonth; i++) {
      days[i + firstDayOfMonth] = monthDays[i];
    }
    
    return days;
  }, [monthStart, monthDays]);

  const getShiftForDate = (date: Date): ShiftAssignment | undefined => {
    if (!date) return undefined;
    
    return shifts.find(shift => {
      const shiftDate = parseISO(shift.date);
      return isSameDay(shiftDate, date);
    });
  };

  const isDateHighlighted = (date: Date): boolean => {
    if (!date || !highlightedDates.length) return false;
    
    return highlightedDates.some(highlightDate => 
      isSameDay(highlightDate, date)
    );
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdays.map(day => (
          <div key={day} className="text-center font-medium text-sm py-2">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="p-2 h-24 border border-transparent"></div>;
          }
          
          const shift = getShiftForDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDates?.some(date => isSameDay(date, day));
          const dayNote = getNote(day);
          const isHighlighted = isDateHighlighted(day);
          
          return (
            <div
              key={day.toString()}
              className={cn(
                "p-2 border relative h-24 transition-colors",
                isCurrentMonth ? "bg-background" : "bg-muted/30 text-muted-foreground",
                isToday(day) && "border-primary",
                isSelected && "bg-primary/10 border-primary/50",
                isHighlighted && highlightColor,
                "hover:bg-accent hover:text-accent-foreground cursor-pointer"
              )}
              onClick={() => onDateClickHandler(day)}
            >
              <div className="flex justify-between items-start">
                <span className={cn(
                  "text-sm font-medium",
                  isToday(day) && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                )}>
                  {format(day, 'd')}
                </span>
                
                {dayNote && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => onNoteClick(day, e)}
                        >
                          <StickyNote className="h-4 w-4 text-amber-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs break-words">{dayNote.text}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              {shift && (
                <div className="mt-1">
                  <Badge 
                    className={cn(
                      "text-xs font-normal truncate max-w-full",
                      shift.shiftType.gradient
                    )}
                  >
                    {shift.shiftType.name}
                  </Badge>
                  
                  {shift.otHours && shift.otHours > 0 && (
                    <Badge variant="outline" className="text-xs font-normal mt-1 border-amber-500 text-amber-500">
                      OT: {shift.otHours}h
                    </Badge>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <NoteEditDialog
        open={isNoteDialogOpen}
        onOpenChange={setIsNoteDialogOpen}
        date={selectedDate}
        existingNote={selectedDate ? getNote(selectedDate) : undefined}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />
    </div>
  );
};

export default Calendar;
