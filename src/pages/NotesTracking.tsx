
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from "date-fns";
import { Note } from "@/types/calendar";
import { StickyNote, Folder, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const NotesTracking = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [calendarNotes, setCalendarNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Load notes from localStorage on component mount
  useEffect(() => {
    loadNotes();
    
    // Add event listener for note updates
    document.addEventListener('notesUpdated', loadNotes);
    
    return () => {
      document.removeEventListener('notesUpdated', loadNotes);
    };
  }, []);

  // Load notes from localStorage
  const loadNotes = () => {
    try {
      // Load regular notes
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
      
      // Load calendar notes
      const storedCalendarNotes = localStorage.getItem('notesFromCalendar');
      if (storedCalendarNotes) {
        setCalendarNotes(JSON.parse(storedCalendarNotes));
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  // Format a note's date for display
  const formatNoteDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Delete a note
  const deleteNote = (noteDate: string, isCalendarNote: boolean) => {
    try {
      // Determine which storage key to use
      const storageKey = isCalendarNote ? 'notesFromCalendar' : 'notes';
      
      // Get existing notes
      const storedNotes = localStorage.getItem(storageKey);
      if (storedNotes) {
        const parsedNotes = JSON.parse(storedNotes);
        // Filter out the note to delete
        const updatedNotes = parsedNotes.filter((note: Note) => note.date !== noteDate);
        // Save back to localStorage
        localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
        
        // Update state
        if (isCalendarNote) {
          setCalendarNotes(updatedNotes);
        } else {
          setNotes(updatedNotes);
        }
        
        // Dispatch event to notify other components
        document.dispatchEvent(new CustomEvent('notesUpdated', {
          detail: { 
            action: "delete", 
            date: noteDate,
            source: isCalendarNote ? "calendar" : "notes"
          }
        }));
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Filter notes based on search term
  const filterNotes = (notesToFilter: Note[]) => {
    if (!searchTerm) return notesToFilter;
    
    return notesToFilter.filter(note => 
      note.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatNoteDate(note.date).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Render a note card
  const renderNote = (note: Note, isCalendarNote: boolean) => (
    <Card key={note.date} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            {formatNoteDate(note.date)}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => deleteNote(note.date, isCalendarNote)}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{note.text}</p>
        
        {/* TOIL/Overtime tracking info */}
        {note.toilType && (
          <div className="mt-2 text-sm">
            <span className={`inline-block px-2 py-1 rounded ${note.toilType === 'taken' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
              TOIL {note.toilType === 'taken' ? 'Taken' : 'Done'}
            </span>
          </div>
        )}
        
        {/* Shift swap info */}
        {note.swap && (
          <div className="mt-2 text-sm">
            <span className={`inline-block px-2 py-1 rounded ${note.swap.type === 'owed' ? 'bg-yellow-100 text-yellow-800' : 'bg-purple-100 text-purple-800'}`}>
              Swap: {note.swap.type === 'owed' ? 'Owed to' : 'Payback from'} {note.swap.workerName}
              {note.swap.hours && ` (${note.swap.hours} hours)`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Render a folder of notes
  const renderNoteFolder = (title: string, icon: React.ReactNode, notesToRender: Note[], isCalendarNotes: boolean) => (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>
          {notesToRender.length} note{notesToRender.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notesToRender.length > 0 ? (
          notesToRender.map(note => renderNote(note, isCalendarNotes))
        ) : (
          <p className="text-muted-foreground text-center py-4">No notes found in this folder</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Notes & Tracking</h1>
      
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Notes</TabsTrigger>
          <TabsTrigger value="calendar">Calendar Notes</TabsTrigger>
          <TabsTrigger value="other">Other Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {renderNoteFolder("Notes from Calendar", <CalendarIcon className="h-5 w-5" />, filterNotes(calendarNotes), true)}
          <Separator />
          {renderNoteFolder("Other Notes", <Folder className="h-5 w-5" />, filterNotes(notes), false)}
        </TabsContent>
        
        <TabsContent value="calendar">
          {renderNoteFolder("Notes from Calendar", <CalendarIcon className="h-5 w-5" />, filterNotes(calendarNotes), true)}
        </TabsContent>
        
        <TabsContent value="other">
          {renderNoteFolder("Other Notes", <Folder className="h-5 w-5" />, filterNotes(notes), false)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotesTracking;
