
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StickyNote } from "lucide-react";
import { Note } from "@/types/calendar";
import { CALENDAR_NOTES_FOLDER } from "@/components/NoteEditDialog";

const CalendarNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    // Load notes from localStorage on component mount
    const loadNotes = () => {
      try {
        const storedNotes = localStorage.getItem("notes");
        if (storedNotes) {
          const parsedNotes = JSON.parse(storedNotes);
          console.log("All notes loaded:", parsedNotes);
          
          // Filter only notes with the CALENDAR_NOTES_FOLDER category
          const calendarNotes = parsedNotes.filter(
            (note: Note) => note.category === CALENDAR_NOTES_FOLDER
          );
          
          console.log("Filtered calendar notes:", calendarNotes);
          setNotes(calendarNotes);
        }
      } catch (error) {
        console.error("Error loading notes:", error);
      }
    };

    loadNotes();

    // Add event listener for notes updates
    const handleNotesUpdated = () => {
      console.log("Notes updated event received in CalendarNotes page");
      loadNotes();
    };

    document.addEventListener("notesUpdated", handleNotesUpdated);

    return () => {
      document.removeEventListener("notesUpdated", handleNotesUpdated);
    };
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <StickyNote className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-bold">Calendar Notes</h1>
      </div>
      
      <Separator className="mb-6" />
      
      {notes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No calendar notes found. Add notes by clicking on dates in the calendar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Card key={note.date} className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(parseISO(note.date), "MMMM d, yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{note.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarNotes;
