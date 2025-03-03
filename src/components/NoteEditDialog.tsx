
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Note } from "@/types/calendar";
import { StickyNote } from "lucide-react";

interface NoteEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  existingNote?: Note;
  onSave: (note: Note) => void;
  onDelete?: (date: string) => void;
}

// Helper function to manage notes in localStorage
const manageLocalStorageNotes = {
  // Get all notes from localStorage
  getNotes: (): Note[] => {
    try {
      return JSON.parse(localStorage.getItem('notesFromCalendar') || '[]');
    } catch (error) {
      console.error("Error reading notes from localStorage:", error);
      return [];
    }
  },
  
  // Save a note to localStorage
  saveNote: (noteData: Note): void => {
    try {
      // Get existing notes
      const existingNotes = manageLocalStorageNotes.getNotes();
      
      // Remove any existing note with the same date to avoid duplicates
      const filteredNotes = existingNotes.filter(note => note.date !== noteData.date);
      
      // Add the new note
      filteredNotes.push(noteData);
      
      // Save back to localStorage
      localStorage.setItem('notesFromCalendar', JSON.stringify(filteredNotes));
      console.log("Note saved to 'notesFromCalendar' successfully");
    } catch (error) {
      console.error("Error saving note to localStorage:", error);
    }
  },
  
  // Delete a note from localStorage
  deleteNote: (dateString: string): void => {
    try {
      // Get existing notes
      const existingNotes = manageLocalStorageNotes.getNotes();
      
      // Filter out the note to delete
      const filteredNotes = existingNotes.filter(note => note.date !== dateString);
      
      // Save back to localStorage
      localStorage.setItem('notesFromCalendar', JSON.stringify(filteredNotes));
      console.log("Note removed from 'notesFromCalendar' successfully");
    } catch (error) {
      console.error("Error removing note from localStorage:", error);
    }
  }
};

const NoteEditDialog = ({ 
  open, 
  onOpenChange, 
  date, 
  existingNote, 
  onSave,
  onDelete 
}: NoteEditDialogProps) => {
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    if (existingNote) {
      setNoteText(existingNote.text);
    } else {
      setNoteText("");
    }
  }, [existingNote, open]);

  if (!date) return null;

  const handleSave = () => {
    if (!noteText.trim()) {
      return; // Don't save empty notes
    }

    // Create the note without a specific category
    const noteData: Note = {
      date: date.toISOString(),
      text: noteText
    };
    
    // Close the dialog immediately before making the save
    onOpenChange(false);
    
    // Save the note using the callback
    onSave(noteData);
    
    // Save to localStorage for the notes tracking page
    manageLocalStorageNotes.saveNote(noteData);
    
    // Notify other components about the note update
    document.dispatchEvent(new CustomEvent('notesUpdated', {
      detail: { 
        noteData,
        action: "save",
        source: "calendar"
      }
    }));
  };

  const handleDelete = () => {
    if (existingNote && onDelete) {
      // Close the dialog immediately before deleting
      onOpenChange(false);
      
      // Call the onDelete function passed as prop
      onDelete(existingNote.date);
      
      // Delete from localStorage
      manageLocalStorageNotes.deleteNote(existingNote.date);
      
      // Notify other components about the note deletion
      document.dispatchEvent(new CustomEvent('notesUpdated', {
        detail: { 
          action: "delete",
          date: existingNote.date,
          source: "calendar"
        }
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Note for {date ? format(date, 'MMMM d, yyyy') : ''}
          </DialogTitle>
          <DialogDescription>
            Add a note for this date. Notes will be shown on the calendar and in the notes section.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write your note here..."
            className="min-h-[150px]"
          />
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {existingNote && onDelete && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
              >
                Delete Note
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Note
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditDialog;
