
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Note } from "@/types/calendar";
import NoteEditDialog from "@/components/NoteEditDialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const NotesTracking = () => {
  // State for notes and UI controls
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("notes");
  
  // Load notes from localStorage on component mount
  useEffect(() => {
    loadNotes();
    
    // Set up event listener for notes updates
    const handleNotesUpdated = () => {
      loadNotes();
    };
    
    document.addEventListener('notesUpdated', handleNotesUpdated);
    
    return () => {
      document.removeEventListener('notesUpdated', handleNotesUpdated);
    };
  }, []);
  
  // Load notes from localStorage
  const loadNotes = () => {
    try {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        const parsedNotes: Note[] = JSON.parse(storedNotes);
        // Sort notes by date (newest first)
        parsedNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNotes(parsedNotes);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };
  
  // Filter notes based on search term
  const filteredNotes = notes.filter(note => 
    note.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    format(new Date(note.date), 'MMMM d, yyyy').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle adding a new note
  const handleAddNote = () => {
    setSelectedDate(new Date());
    setSelectedNote(undefined);
    setIsAddingNote(true);
  };
  
  // Handle editing an existing note
  const handleEditNote = (note: Note) => {
    setSelectedDate(new Date(note.date));
    setSelectedNote(note);
    setIsAddingNote(true);
  };
  
  // Handle saving a note
  const handleSaveNote = (noteData: Note) => {
    // The actual saving is handled in NoteEditDialog component
    loadNotes(); // Refresh notes list
  };
  
  // Handle deleting a note
  const handleDeleteNote = (date: string) => {
    // The actual deletion is handled in NoteEditDialog component
    loadNotes(); // Refresh notes list
  };
  
  return (
    <div className="container mx-auto p-4 max-w-3xl pb-20">
      <h1 className="text-2xl font-bold mb-6">Notes & Tracking</h1>
      
      {/* Search and Add Note Row */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>+ Add Note</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleAddNote}>
              Add Today's Note
            </DropdownMenuItem>
            <DropdownMenuItem>
              Add Shift Swap
            </DropdownMenuItem>
            <DropdownMenuItem>
              Add TOIL Record
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="shift-swap">Shift Swap/TOIL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notes" className="space-y-4">
          {/* Your Notes Section */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Your Notes</h2>
            
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No notes match your search" : "No notes yet. Add your first note!"}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotes.map((note) => (
                  <div 
                    key={note.date}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => handleEditNote(note)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {format(new Date(note.date), 'MMMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-3">{note.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Notes From Calendar Section */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Notes From Calendar</h2>
            
            <div className="text-center py-8 text-muted-foreground">
              No calendar notes with upcoming alarms
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="shift-swap" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            Shift Swap and TOIL tracking will be available soon
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Note Edit Dialog */}
      <NoteEditDialog
        open={isAddingNote}
        onOpenChange={setIsAddingNote}
        date={selectedDate}
        existingNote={selectedNote}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />
    </div>
  );
};

export default NotesTracking;
