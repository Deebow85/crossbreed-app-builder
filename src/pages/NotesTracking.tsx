
import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StickyNote, Trash2 } from "lucide-react";
import { useNotes } from "@/hooks/use-notes";
import NoteDialog from "@/components/NoteDialog";
import { toast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Note } from "@/types/calendar";

export default function NotesTracking() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const { notes, addNote, deleteNote, getNoteForDate } = useNotes();

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const existingNote = getNoteForDate(date);
    
    if (existingNote) {
      setSelectedNote(existingNote);
    } else {
      setSelectedNote(null);
    }
    
    setIsNoteDialogOpen(true);
  };

  const handleNoteAdd = (note: Note) => {
    addNote(note);
  };

  const handleNoteDelete = (dateString: string) => {
    deleteNote(dateString);
    toast({
      title: "Note deleted",
      description: "Your note has been removed."
    });
    setIsDeleteDialogOpen(false);
  };

  const openDeleteDialog = (note: Note) => {
    setSelectedNote(note);
    setIsDeleteDialogOpen(true);
  };

  // Sorting notes by date (newest first)
  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                Calendar Notes
              </CardTitle>
              <CardDescription>
                Click on a date to add or edit a note
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate || undefined}
                onSelect={(date) => date && handleDayClick(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-1/2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                Your Notes
              </CardTitle>
              <CardDescription>
                All your saved notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedNotes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No notes yet. Click on a calendar date to create one.
                  </div>
                ) : (
                  sortedNotes.map((note) => (
                    <Card key={note.date} className="relative">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium">
                          {format(new Date(note.date), "EEEE, MMMM d, yyyy")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 pb-3">
                        <p className="whitespace-pre-wrap">{note.text}</p>
                        <div className="flex justify-end mt-2 gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedDate(new Date(note.date));
                              setSelectedNote(note);
                              setIsNoteDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openDeleteDialog(note)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Note Dialog */}
      {isNoteDialogOpen && selectedDate && (
        <NoteDialog
          date={selectedDate}
          isOpen={isNoteDialogOpen}
          onClose={() => setIsNoteDialogOpen(false)}
          onSave={handleNoteAdd}
          existingNote={selectedNote || undefined}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedNote && handleNoteDelete(selectedNote.date)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
