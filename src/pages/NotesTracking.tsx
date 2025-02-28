
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StickyNote, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Note } from "@/types/calendar";
import { getAllNotes, getNotesFromCalendar, deleteNote } from "@/services/noteService";
import { useToast } from "@/hooks/use-toast";

const NotesTracking = () => {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [calendarNotes, setCalendarNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState("all-notes");
  const { toast } = useToast();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const notes = getAllNotes();
    setAllNotes(notes);
    
    const fromCalendar = getNotesFromCalendar();
    setCalendarNotes(fromCalendar);
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    loadNotes();
    toast({
      title: "Note deleted",
      description: "Your note has been deleted.",
    });
  };

  const renderNoteList = (notes: Note[]) => {
    if (notes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <StickyNote className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No notes found</h3>
          <p className="text-muted-foreground mt-2">
            {activeTab === "calendar-notes" 
              ? "Add notes from the calendar by clicking on a date."
              : "Create notes to keep track of important information."}
          </p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[60vh]">
        <div className="space-y-4 p-1">
          {notes.map((note) => (
            <Card key={note.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  {note.id.startsWith('note-') ? (
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <StickyNote className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-muted-foreground">
                    {format(new Date(note.date), 'MMMM d, yyyy')}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all-notes">All Notes</TabsTrigger>
          <TabsTrigger value="calendar-notes">Notes from Calendar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-notes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Notes</CardTitle>
              <CardDescription>
                View and manage all your notes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderNoteList(allNotes)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar-notes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes from Calendar</CardTitle>
              <CardDescription>
                Notes created from calendar dates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderNoteList(calendarNotes)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotesTracking;
