
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
  Check,
  User,
  Calendar
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  // Handle card click
  const handleCardClick = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null);
    } else {
      setActiveCategory(category);
    }
  };

  // Get filtered records based on active category
  const getFilteredRecords = () => {
    switch (activeCategory) {
      case 'shiftSwaps':
        return filterNotes(getShiftSwapRecords());
      case 'toilTaken':
        return filterNotes(getToilRecords().filter(isToilTaken));
      case 'toilDone':
        return filterNotes(getToilRecords().filter(isToilDone));
      case 'notes':
        return filterNotes(notes);
      case 'calendarNotes':
        return filterNotes(calendarNotes);
      default:
        return [];
    }
  };

  const renderNoteList = () => {
    const records = getFilteredRecords();
    
    if (records.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No records found.
        </div>
      );
    }

    return (
      <div className="space-y-4 mt-4">
        {records.map((record) => (
          <Card key={record.date} className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">{formatNoteDate(record.date)}</div>
                  {record.swap && (
                    <div className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                      {getSwapTypeDisplay(record)}
                    </div>
                  )}
                  {record.toilType && (
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      isToilTaken(record) 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {isToilTaken(record) ? 'TOIL Taken' : 'TOIL Done'}
                    </div>
                  )}
                </div>
                <p className="text-sm">{record.text}</p>
                {record.swap && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <User size={14} />
                    <span>With: {record.swap.workerName || 'Not specified'}</span>
                  </div>
                )}
                {(record.swap || record.toilType) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar size={14} />
                    <span>Date: {formatNoteDate(record.date)}</span>
                  </div>
                )}
                <div className="flex justify-end mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => deleteNote(record.date, activeCategory === 'calendarNotes')}
                    className="text-xs"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
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
          
          <Card 
            className={`mb-4 hover:bg-muted/50 transition-colors cursor-pointer ${activeCategory === 'notes' ? 'border-primary' : ''}`}
            onClick={() => handleCardClick('notes')}
          >
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
          
          <Card 
            className={`mb-4 hover:bg-muted/50 transition-colors cursor-pointer ${activeCategory === 'calendarNotes' ? 'border-primary' : ''}`}
            onClick={() => handleCardClick('calendarNotes')}
          >
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
          
          {activeCategory === 'notes' || activeCategory === 'calendarNotes' ? renderNoteList() : null}
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
          
          <Card 
            className={`mb-4 hover:bg-muted/50 transition-colors cursor-pointer ${activeCategory === 'shiftSwaps' ? 'border-primary' : ''}`}
            onClick={() => handleCardClick('shiftSwaps')}
          >
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
          
          <Card 
            className={`mb-4 hover:bg-muted/50 transition-colors cursor-pointer ${activeCategory === 'toilTaken' ? 'border-primary' : ''}`}
            onClick={() => handleCardClick('toilTaken')}
          >
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
          
          <Card 
            className={`mb-4 hover:bg-muted/50 transition-colors cursor-pointer ${activeCategory === 'toilDone' ? 'border-primary' : ''}`}
            onClick={() => handleCardClick('toilDone')}
          >
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
          
          {activeCategory === 'shiftSwaps' || activeCategory === 'toilTaken' || activeCategory === 'toilDone' ? renderNoteList() : null}
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
