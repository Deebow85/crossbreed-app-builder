
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, StickyNote, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Note } from "@/types/calendar";
import { getAllNotes, deleteNote } from "@/services/noteService";
import { useToast } from "@/components/ui/use-toast";
import NoteEditDialog from "@/components/NoteEditDialog";

const NotesTracking = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState("all-notes");
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const allNotes = getAllNotes();
    setNotes(allNotes);
  };

  const handleDeleteNote = (date: string) => {
    deleteNote(date);
    loadNotes();
    toast({
      title: "Note deleted",
      description: "Your note has been deleted."
    });
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setSelectedDate(parseISO(note.date));
    setIsDialogOpen(true);
  };

  const handleSaveNote = (updatedNote: Note) => {
    // Just reload notes after edit - the dialog component handles the actual saving
    loadNotes();
  };

  const renderNotesList = (notesToRender: Note[]) => {
    if (notesToRender.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <StickyNote className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No notes found</h3>
          <p className="text-muted-foreground mt-2">
            Add notes from the calendar by right-clicking on a date.
          </p>
        </div>
      );
    }

    // Sort notes by date (newest first)
    const sortedNotes = [...notesToRender].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return (
      <ScrollArea className="h-[60vh]">
        <div className="space-y-4 p-1">
          {sortedNotes.map((note) => (
            <Card key={note.date} className="overflow-hidden">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {format(parseISO(note.date), "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditNote(note)}
                  >
                    <StickyNote className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteNote(note.date)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <p className="whitespace-pre-wrap break-words">{note.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Notes Tracking</h1>
      </div>
      <Separator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="all-notes">All Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-notes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>
                View and manage all your notes, including those added from the calendar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderNotesList(notes)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NoteEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        date={selectedDate}
        existingNote={editingNote}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />
    </div>
  );
};

export default NotesTracking;
