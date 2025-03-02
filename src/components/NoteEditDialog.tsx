
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

// Define the exact folder name as a constant to ensure consistency
const CALENDAR_NOTES_FOLDER = "notes from calendar";

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

    // Create the note with the calendar category - IMPORTANT: exact string match needed
    const noteData: Note = {
      date: date.toISOString(),
      text: noteText,
      category: CALENDAR_NOTES_FOLDER  // Using constant for consistency
    };
    
    // Log before saving to verify category
    console.log("About to save note with category:", noteData.category);
    
    // Close the dialog immediately before making the save
    onOpenChange(false);
    
    // Then save the note
    onSave(noteData);
    
    // Use the component's toast function from useToast hook
    toast({
      title: "Note saved",
      description: "Your note has been saved successfully.",
    });
    
    // Make sure the noteData is stored in localStorage directly as well
    // This ensures it will show up on the Notes page regardless of event handling
    try {
      const existingNotes = JSON.parse(localStorage.getItem('notes') || '[]');
      
      // Remove any existing note with the same date if it exists to avoid duplicates
      const filteredNotes = existingNotes.filter((note: Note) => note.date !== noteData.date);
      
      // CRITICAL: Ensure category is exactly "notes from calendar" (no variation in casing or spacing)
      const noteWithCategory = {
        ...noteData,
        category: CALENDAR_NOTES_FOLDER
      };
      
      filteredNotes.push(noteWithCategory);
      
      // Save back to localStorage
      localStorage.setItem('notes', JSON.stringify(filteredNotes));
      console.log("Note saved directly to localStorage with category:", noteWithCategory.category);
    } catch (error) {
      console.error("Error saving note to localStorage:", error);
    }
    
    // Dispatch a custom event to notify that notes have been updated
    const notesUpdatedEvent = new CustomEvent('notesUpdated', {
      detail: { 
        noteData: {
          ...noteData,
          category: CALENDAR_NOTES_FOLDER // Ensure exact string match in event data
        },
        action: "save",
        category: CALENDAR_NOTES_FOLDER // Exact string match for category
      }
    });
    document.dispatchEvent(notesUpdatedEvent);
    
    // Console log to help debug
    console.log("Note saved with category:", CALENDAR_NOTES_FOLDER);
    console.log("notesUpdated event dispatched with:", JSON.stringify(notesUpdatedEvent.detail));
  };

  const handleDelete = () => {
    if (existingNote && onDelete) {
      // Close the dialog immediately before deleting
      onOpenChange(false);
      
      // Log deletion to verify
      console.log("About to delete note with category:", existingNote.category || CALENDAR_NOTES_FOLDER);
      
      onDelete(existingNote.date);
      
      // Use the component's toast function instead of direct toast call
      toast({
        title: "Note deleted",
        description: "Your note has been deleted.",
      });
      
      // Directly remove from localStorage as well to ensure it's removed from Notes page
      try {
        const existingNotes = JSON.parse(localStorage.getItem('notes') || '[]');
        const filteredNotes = existingNotes.filter((note: Note) => note.date !== existingNote.date);
        localStorage.setItem('notes', JSON.stringify(filteredNotes));
        console.log("Note removed directly from localStorage");
      } catch (error) {
        console.error("Error removing note from localStorage:", error);
      }
      
      // Dispatch a custom event to notify that notes have been updated
      const notesUpdatedEvent = new CustomEvent('notesUpdated', {
        detail: { 
          action: "delete",
          date: existingNote.date,
          category: CALENDAR_NOTES_FOLDER // Exact string match for category
        }
      });
      document.dispatchEvent(notesUpdatedEvent);
      console.log("Note deleted event dispatched with:", JSON.stringify(notesUpdatedEvent.detail));
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
