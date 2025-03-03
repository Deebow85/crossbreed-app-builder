
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { Note } from "@/types/calendar";
import { StickyNote } from "lucide-react";

interface NoteDialogProps {
  date: Date | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  existingNote?: Note;
}

const NoteDialog = ({ date, isOpen, onClose, onSave, existingNote }: NoteDialogProps) => {
  const [noteText, setNoteText] = useState(existingNote?.text || "");
  
  if (!date) return null;
  
  const formattedDate = format(date, "EEEE, MMMM d, yyyy");
  const isEditing = !!existingNote;
  
  const handleSave = () => {
    if (noteText.trim() === "") {
      toast({
        title: "Note cannot be empty",
        description: "Please enter some text for your note.",
        variant: "destructive"
      });
      return;
    }
    
    const newNote: Note = {
      date: date.toISOString(),
      text: noteText,
      ...(existingNote && { swap: existingNote.swap }),
      ...(existingNote && { toilType: existingNote.toilType }),
      ...(existingNote && { isToilDone: existingNote.isToilDone }),
      ...(existingNote && { isToilTaken: existingNote.isToilTaken })
    };
    
    onSave(newNote);
    onClose();
    
    toast({
      title: `Note ${isEditing ? "updated" : "saved"}`,
      description: `Your note for ${format(date, "MMM d")} has been ${isEditing ? "updated" : "saved"}.`
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            {isEditing ? "Edit" : "Create"} Note for {formattedDate}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            id="note-content"
            placeholder="Enter your note here..."
            className="min-h-[150px]"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
        </div>
        
        <DialogFooter className="flex space-x-2 sm:space-x-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? "Update" : "Save"} Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteDialog;
