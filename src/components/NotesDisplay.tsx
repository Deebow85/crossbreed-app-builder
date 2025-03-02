
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Note } from "@/types/calendar";
import { StickyNote } from "lucide-react";

interface NotesDisplayProps {
  category: string;
  title: string;
  description?: string;
}

const NotesDisplay: React.FC<NotesDisplayProps> = ({ 
  category,
  title,
  description
}) => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    // Load notes from localStorage
    const loadNotes = () => {
      const notesData = localStorage.getItem('notes');
      if (notesData) {
        const allNotes = JSON.parse(notesData) as Note[];
        const filteredNotes = allNotes.filter(note => note.category === category);
        setNotes(filteredNotes);
      }
    };

    loadNotes();
    
    // Listen for storage events to update notes when they change
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notes') {
        loadNotes();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Create a custom event listener for notes updates
    const handleNotesUpdate = () => loadNotes();
    window.addEventListener('notesUpdated', handleNotesUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('notesUpdated', handleNotesUpdate);
    };
  }, [category]);

  if (notes.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notes.map((note) => (
            <div 
              key={note.date} 
              className="p-4 rounded-lg border bg-background"
            >
              <div className="text-sm text-muted-foreground mb-2">
                {format(new Date(note.date), 'MMMM d, yyyy')}
              </div>
              <div className="whitespace-pre-wrap">{note.text}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotesDisplay;
