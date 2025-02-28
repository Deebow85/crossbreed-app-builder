
import { useState, useEffect } from "react";
import { addMonths, subMonths, startOfMonth, format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/Calendar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useTheme } from "@/lib/theme";
import ShiftSelectionDialog from "@/components/ShiftSelectionDialog";
import NoteEditDialog from "@/components/NoteEditDialog";
import { Note } from "@/types/calendar";
import { getNoteByDate, saveNote, deleteNote } from "@/services/noteService";
import { useToast } from "@/hooks/use-toast";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);
  const { toast } = useToast();
  const { theme } = useTheme();

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prevDate) => {
      if (direction === "prev") {
        return subMonths(prevDate, 1);
      } else {
        return addMonths(prevDate, 1);
      }
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    
    // Check if there's an existing note for this date
    const dateString = date.toISOString().split('T')[0];
    const existingNote = getNoteByDate(dateString);
    setSelectedNote(existingNote);
    
    // Open context menu or dialog
    setIsShiftDialogOpen(true);
  };

  const handleNoteClick = () => {
    if (selectedDate) {
      setIsShiftDialogOpen(false);
      setIsNoteDialogOpen(true);
    }
  };

  const handleSaveNote = (note: Note) => {
    saveNote(note);
    toast({
      title: "Note saved",
      description: "Your note has been saved to the calendar."
    });
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    setSelectedNote(undefined);
    toast({
      title: "Note deleted",
      description: "The note has been removed from this date."
    });
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4">
          <h2 className="text-lg font-semibold">
            {format(startOfMonth(currentDate), "MMMM yyyy")}
          </h2>
        </div>
        <Separator />
        <div>
          <CalendarComponent 
            currentDate={currentDate} 
            onDayClick={handleDateClick}
          />
        </div>
      </div>

      {/* Shift Selection Dialog with Note Option */}
      <ShiftSelectionDialog 
        isOpen={isShiftDialogOpen}
        onClose={() => setIsShiftDialogOpen(false)}
        selectedDate={selectedDate}
        hasNote={!!selectedNote}
        onNoteClick={handleNoteClick}
      />

      {/* Note Edit Dialog */}
      <NoteEditDialog
        isOpen={isNoteDialogOpen}
        onClose={() => setIsNoteDialogOpen(false)}
        date={selectedDate}
        existingNote={selectedNote}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />
    </div>
  );
};

export default Calendar;
