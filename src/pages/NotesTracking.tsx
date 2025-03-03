
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { Note } from "@/types/calendar";
import { StickyNote } from "lucide-react";

const NotesTracking = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const savedNotes = localStorage.getItem('calendarNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Notes Tracking</h1>
      
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <StickyNote className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No notes found. Add notes by right-clicking on dates in the calendar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).map((note) => (
            <Card key={note.date} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <StickyNote className="h-4 w-4" />
                <h3 className="font-medium">{format(parseISO(note.date), 'MMMM d, yyyy')}</h3>
              </div>
              <p className="whitespace-pre-wrap">{note.text}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesTracking;
