
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

    const noteData: Note = {
      date: date.toISOString(),
      text: noteText,
      category: "notes from calendar" // Always set the category for calendar notes
    };
    
    // Preserve existing category if this is an edit
    if (existingNote && existingNote.category) {
      noteData.category = existingNote.category;
    }
    
    // Close the dialog immediately before making the save
    onOpenChange(false);
    
    // Then save the note
    onSave(noteData);
    
    // Use the component's toast function from useToast hook
    toast({
      title: "Note saved",
      description: "Your note has been saved successfully.",
    });
    
    // Dispatch a custom event to notify that notes have been updated
    // This will allow the NotesTracking page to refresh its data
    const notesUpdatedEvent = new CustomEvent('notesUpdated', {
      detail: { 
        noteData,
        category: "notes from calendar" // Explicitly include the category in the event
      }
    });
    document.dispatchEvent(notesUpdatedEvent);
    
    // Console log to help debug
    console.log("Note saved with category:", noteData.category);
  };

  const handleDelete = () => {
    if (existingNote && onDelete) {
      // Close the dialog immediately before deleting
      onOpenChange(false);
      
      onDelete(existingNote.date);
      
      // Use the component's toast function instead of direct toast call
      toast({
        title: "Note deleted",
        description: "Your note has been deleted.",
      });
      
      // Dispatch a custom event to notify that notes have been updated
      const notesUpdatedEvent = new CustomEvent('notesUpdated', {
        detail: { 
          category: "notes from calendar" // Include the category in the delete event too
        }
      });
      document.dispatchEvent(notesUpdatedEvent);
      console.log("Note deleted event dispatched");
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
            Add a note for this date. Notes will be shown on the calendar.
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
