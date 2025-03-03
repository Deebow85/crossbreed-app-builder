
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Note } from "@/types/calendar";
import { StickyNote, Folder, ChevronDown, Search, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from "date-fns";

const NotesTracking = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [calendarNotes, setCalendarNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addNoteOpen, setAddNoteOpen] = useState(false);

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

  // Get count of items in a folder
  const getItemCount = (items: Note[]) => {
    return `${items.length} item${items.length !== 1 ? 's' : ''}`;
  };

  // Filter notes based on search term
  const filterNotes = (notesToFilter: Note[]) => {
    if (!searchTerm) return notesToFilter;
    
    return notesToFilter.filter(note => 
      note.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatNoteDate(note.date).toLowerCase().includes(searchTerm.toLowerCase())
    );
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

  return (
    <div className="container py-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Notes & Tracking</h1>
      
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          type="text"
          placeholder="Search notes or swaps..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Tabs defaultValue="notes" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="swaps">Shift Swap / TOIL</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Button 
        variant="ghost" 
        className="w-full flex justify-between items-center py-4 mb-6 border rounded-md shadow-sm"
        onClick={() => setAddNoteOpen(!addNoteOpen)}
      >
        <div className="flex items-center">
          <Plus size={16} className="mr-2" />
          <span>Add Note</span>
        </div>
        <ChevronDown size={16} className={`transition-transform ${addNoteOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      <h2 className="text-lg font-semibold mb-4">Your Notes</h2>
      
      <Card className="mb-4 hover:bg-muted/50 transition-colors cursor-pointer">
        <CardHeader className="py-4 px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Folder className="h-5 w-5 mr-2 text-muted-foreground" />
              <CardTitle className="text-md">Notes</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">{getItemCount(notes)}</span>
          </div>
        </CardHeader>
      </Card>
      
      <Card className="mb-4 hover:bg-muted/50 transition-colors cursor-pointer">
        <CardHeader className="py-4 px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-muted-foreground" />
              <CardTitle className="text-md">Notes From Calendar</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">{getItemCount(calendarNotes)}</span>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default NotesTracking;
