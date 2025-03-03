
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Note, ShiftSwap, TOILType } from "@/types/calendar";
import { 
  StickyNote, 
  Folder, 
  ChevronDown, 
  Search, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  ArrowLeftRight,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from "date-fns";
import NoteEditDialog from "@/components/NoteEditDialog";

const NotesTracking = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [calendarNotes, setCalendarNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [editNoteDialogOpen, setEditNoteDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

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

  // Get TOIL records (notes with TOIL type)
  const getToilRecords = () => {
    const allNotes = [...notes, ...calendarNotes];
    return allNotes.filter(note => note.toilType);
  };

  // Get Shift Swap records (notes with swap property)
  const getShiftSwapRecords = () => {
    const allNotes = [...notes, ...calendarNotes];
    return allNotes.filter(note => note.swap);
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

  // Handle adding a new note
  const handleAddNote = () => {
    setCurrentDate(new Date());
    setEditNoteDialogOpen(true);
  };

  // Save a new note
  const saveNote = (newNote: Note) => {
    try {
      const storageKey = 'notes';
      const storedNotes = localStorage.getItem(storageKey) || '[]';
      const parsedNotes = JSON.parse(storedNotes);
      
      // Remove any note with the same date
      const updatedNotes = parsedNotes.filter((note: Note) => note.date !== newNote.date);
      
      // Add the new note
      updatedNotes.push(newNote);
      
      // Save to localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
      
      // Update state
      setNotes(updatedNotes);
      
      // Dispatch event to notify other components
      document.dispatchEvent(new CustomEvent('notesUpdated', {
        detail: { 
          action: "save", 
          noteData: newNote,
          source: "notes"
        }
      }));
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  // Determine if a note is a TOIL record taken
  const isToilTaken = (note: Note): boolean => {
    return note.toilType === 'taken' || !!note.isToilTaken;
  };

  // Determine if a note is a TOIL record done
  const isToilDone = (note: Note): boolean => {
    return note.toilType === 'done' || !!note.isToilDone;
  };

  // Get the swap type for display
  const getSwapTypeDisplay = (note: Note): string => {
    if (!note.swap) return '';
    return note.swap.type === 'owed' ? 'You owe shift' : 'Shift owed to you';
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
        
        <TabsContent value="notes" className="space-y-4">
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
        </TabsContent>
        
        <TabsContent value="swaps" className="space-y-4">
          <Button 
            variant="ghost" 
            className="w-full flex justify-between items-center py-4 mb-6 border rounded-md shadow-sm"
            onClick={handleAddNote}
          >
            <div className="flex items-center">
              <Plus size={16} className="mr-2" />
              <span>Add Swap / TOIL Record</span>
            </div>
            <ChevronDown size={16} />
          </Button>
          
          <Card className="mb-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="py-4 px-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <ArrowLeftRight className="h-5 w-5 mr-2 text-muted-foreground" />
                  <CardTitle className="text-md">Shift Swaps</CardTitle>
                </div>
                <span className="text-sm text-muted-foreground">
                  {getItemCount(getShiftSwapRecords())}
                </span>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="mb-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="py-4 px-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  <CardTitle className="text-md">TOIL Taken</CardTitle>
                </div>
                <span className="text-sm text-muted-foreground">
                  {getItemCount(getToilRecords().filter(isToilTaken))}
                </span>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="mb-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="py-4 px-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-muted-foreground" />
                  <CardTitle className="text-md">TOIL Done</CardTitle>
                </div>
                <span className="text-sm text-muted-foreground">
                  {getItemCount(getToilRecords().filter(isToilDone))}
                </span>
              </div>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Note Edit Dialog */}
      <NoteEditDialog
        open={editNoteDialogOpen}
        onOpenChange={setEditNoteDialogOpen}
        date={currentDate}
        onSave={saveNote}
      />
    </div>
  );
};

export default NotesTracking;
