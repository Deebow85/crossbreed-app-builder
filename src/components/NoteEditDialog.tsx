
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
import { useToast } from "@/components/ui/use-toast";

interface NoteEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  existingNote?: Note;
  onSave: (note: Note) => void;
  onDelete?: (date: string) => void;
}

// Define the exact folder name as a constant with a new value
// This exact string must be used everywhere
export const CALENDAR_NOTES_FOLDER = "Calendar Notes";

const NoteEditDialog = ({ 
  open, 
  onOpenChange, 
  date, 
  existingNote, 
  onSave,
  onDelete 
}: NoteEditDialogProps) => {
  const [noteText, setNoteText] = useState("");
  const { toast } = useToast();

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
      toast({
        title: "Note cannot be empty",
        description: "Please enter some text for your note.",
        variant: "destructive"
      });
      return;
    }

    // Create the note with the new calendar category name
    const noteData: Note = {
      date: date.toISOString(),
      text: noteText,
      category: CALENDAR_NOTES_FOLDER
    };
    
    // Log extensively for debugging
    console.log("About to save note with category:", CALENDAR_NOTES_FOLDER);
    console.log("Note data:", JSON.stringify(noteData));
    
    // Close the dialog immediately before making the save
    onOpenChange(false);
    
    // Pass the note to the parent component's save handler
    onSave(noteData);
    
    // Show success toast
    toast({
      title: "Note saved",
      description: "Your note has been saved successfully.",
    });
    
    // Direct localStorage handling with detailed logging
    try {
      // Get existing notes
      const existingNotesString = localStorage.getItem('notes');
      console.log("Existing notes string:", existingNotesString);
      const existingNotes = JSON.parse(existingNotesString || '[]');
      console.log("Parsed existing notes:", existingNotes);
      
      // Remove any existing note with the same date
      const filteredNotes = existingNotes.filter((note: Note) => note.date !== noteData.date);
      console.log("After filtering out existing note with same date:", filteredNotes);
      
      // Create a new note with new category string
      const newNote = {
        date: noteData.date,
        text: noteData.text,
        category: CALENDAR_NOTES_FOLDER
      };
      console.log("New note to be added:", newNote);
      
      // Add the new note
      filteredNotes.push(newNote);
      
      // Save back to localStorage
      const notesToSave = JSON.stringify(filteredNotes);
      console.log("Notes to be saved to localStorage:", notesToSave);
      localStorage.setItem('notes', notesToSave);
      
      // Verify the note was saved correctly
      const savedNotesString = localStorage.getItem('notes');
      const savedNotes = JSON.parse(savedNotesString || '[]');
      const savedNote = savedNotes.find((note: Note) => note.date === noteData.date);
      console.log("Verification - saved note category:", savedNote?.category);
      console.log("All notes in localStorage:", savedNotes);
    } catch (error) {
      console.error("Error saving note to localStorage:", error);
    }
    
    // Dispatch a detailed custom event for notes update
    const notesUpdatedEvent = new CustomEvent('notesUpdated', {
      detail: { 
        noteData: {
          date: noteData.date,
          text: noteData.text,
          category: CALENDAR_NOTES_FOLDER
        },
        action: "save",
        category: CALENDAR_NOTES_FOLDER
      }
    });
    
    document.dispatchEvent(notesUpdatedEvent);
    console.log("notesUpdated event dispatched with category:", CALENDAR_NOTES_FOLDER);
    console.log("Complete event details:", notesUpdatedEvent.detail);
  };

  const handleDelete = () => {
    if (existingNote && onDelete) {
      // Close the dialog immediately
      onOpenChange(false);
      
      // Log deletion
      console.log("About to delete note with date:", existingNote.date);
      console.log("Note category:", existingNote.category || CALENDAR_NOTES_FOLDER);
      
      // Call the delete handler
      onDelete(existingNote.date);
      
      // Show success toast
      toast({
        title: "Note deleted",
        description: "Your note has been deleted.",
      });
      
      // Direct localStorage handling for deletion with logging
      try {
        const existingNotesString = localStorage.getItem('notes');
        console.log("Existing notes before deletion:", existingNotesString);
        const existingNotes = JSON.parse(existingNotesString || '[]');
        
        const filteredNotes = existingNotes.filter((note: Note) => note.date !== existingNote.date);
        console.log("Notes after filtering out deleted note:", filteredNotes);
        
        localStorage.setItem('notes', JSON.stringify(filteredNotes));
        console.log("Updated localStorage after deletion");
      } catch (error) {
        console.error("Error removing note from localStorage:", error);
      }
      
      // Dispatch a custom event for note deletion
      const notesUpdatedEvent = new CustomEvent('notesUpdated', {
        detail: { 
          action: "delete",
          date: existingNote.date,
          category: CALENDAR_NOTES_FOLDER
        }
      });
      document.dispatchEvent(notesUpdatedEvent);
      console.log("Note deleted event dispatched:", notesUpdatedEvent.detail);
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
            Add a note for this date. Notes will be shown on the calendar and in the "{CALENDAR_NOTES_FOLDER}" folder.
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
