
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Search, Plus, Clock, ArrowLeftRight, CalendarDays, ChevronLeft, ChevronRight, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Note, ShiftSwap, SwapType } from "@/types/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const NotesTracking = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("notes");
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [swaps, setSwaps] = useState<ShiftSwap[]>([]);
  const [swapWorkerName, setSwapWorkerName] = useState("");
  const [swapHours, setSwapHours] = useState("");
  const [swapType, setSwapType] = useState<SwapType>("owed");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    "swap-done": true,
    "swap-owed": true,
    "toil": true,
    "notes": true,
    "calendar-notes": true
  });
  
  // Load notes and swaps from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error("Error loading notes:", e);
      }
    }

    const savedSwaps = localStorage.getItem("swaps");
    if (savedSwaps) {
      try {
        setSwaps(JSON.parse(savedSwaps));
      } catch (e) {
        console.error("Error loading swaps:", e);
      }
    }
  }, []);

  const saveNote = () => {
    if (!noteText.trim()) {
      toast({
        title: "Empty note",
        description: "Please enter some text for your note",
        variant: "destructive",
      });
      return;
    }

    const dateString = format(currentDate, "yyyy-MM-dd");
    const newNote: Note = {
      date: dateString,
      text: noteText,
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
    
    setNoteText("");
    
    toast({
      title: "Note saved",
      description: `Note added for ${format(currentDate, "MMM d, yyyy")}`,
    });
  };

  const saveSwap = () => {
    if (!swapWorkerName.trim()) {
      toast({
        title: "No name provided",
        description: "Please enter the name of the person you swapped with",
        variant: "destructive",
      });
      return;
    }

    if (!swapHours || isNaN(parseFloat(swapHours)) || parseFloat(swapHours) <= 0) {
      toast({
        title: "Invalid hours",
        description: "Please enter a valid number of hours",
        variant: "destructive",
      });
      return;
    }

    const dateString = format(currentDate, "yyyy-MM-dd");
    const newSwap: ShiftSwap = {
      date: dateString,
      workerName: swapWorkerName,
      type: swapType,
      hours: parseFloat(swapHours),
    };

    const updatedSwaps = [...swaps, newSwap];
    setSwaps(updatedSwaps);
    localStorage.setItem("swaps", JSON.stringify(updatedSwaps));
    
    setSwapWorkerName("");
    setSwapHours("");
    
    toast({
      title: "Shift swap recorded",
      description: `${swapType === "owed" ? "You owe" : "You're owed"} ${swapHours} hours from ${swapWorkerName}`,
    });
  };

  // Filter notes and swaps based on search term
  const filteredNotes = notes.filter(note => 
    note.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.date.includes(searchTerm)
  );

  const filteredSwaps = swaps.filter(swap => 
    swap.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    swap.date.includes(searchTerm)
  );

  // Categorize notes and swaps
  const categorizedItems = {
    "swap-done": filteredSwaps.filter(swap => swap.type === "payback"),
    "swap-owed": filteredSwaps.filter(swap => swap.type === "owed"),
    "toil": filteredNotes.filter(note => note.text.toLowerCase().includes("toil")),
    "notes": filteredNotes.filter(note => 
      !note.text.toLowerCase().includes("toil") && 
      !note.text.toLowerCase().includes("swap") &&
      !note.swap
    ),
    "calendar-notes": filteredNotes.filter(note => note.swap)
  };

  // Toggle folder open/closed state
  const toggleFolder = (folder: string) => {
    setOpenFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  // Navigate to previous or next month
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(prevDate.getMonth() - 1);
      } else {
        newDate.setMonth(prevDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Get folder name for display
  const getFolderName = (key: string): string => {
    switch (key) {
      case "swap-done": return "Shift Swap (Done)";
      case "swap-owed": return "Shift Swap (Owed)";
      case "toil": return "TOIL";
      case "notes": return "Notes";
      case "calendar-notes": return "Notes From Calendar";
      default: return key;
    }
  };

  // Add some dummy data if there are no notes or swaps yet
  useEffect(() => {
    // Check if there's already data
    if (notes.length === 0 && swaps.length === 0) {
      const dummyNotes: Note[] = [
        {
          date: format(new Date(), "yyyy-MM-dd"),
          text: "Regular note with some important information",
        },
        {
          date: format(new Date(Date.now() - 86400000), "yyyy-MM-dd"),
          text: "TOIL hours accumulated: 4 hours on project X",
        },
        {
          date: format(new Date(Date.now() - 172800000), "yyyy-MM-dd"),
          text: "Meeting notes from team standup",
        }
      ];
      
      const dummySwaps: ShiftSwap[] = [
        {
          date: format(new Date(), "yyyy-MM-dd"),
          workerName: "John Smith",
          type: "payback",
          hours: 4,
        },
        {
          date: format(new Date(Date.now() - 86400000), "yyyy-MM-dd"),
          workerName: "Sarah Jones",
          type: "owed",
          hours: 3,
        }
      ];
      
      setNotes(dummyNotes);
      setSwaps(dummySwaps);
      
      // Store in localStorage
      localStorage.setItem("notes", JSON.stringify(dummyNotes));
      localStorage.setItem("swaps", JSON.stringify(dummySwaps));
    }
  }, [notes.length, swaps.length]);

  return (
    <div className="container max-w-md mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-4">Notes & Tracking</h1>
      
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes or swaps..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>
        <h2 className="text-lg font-medium">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <Card className="mb-4">
        <CardContent className="p-3">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Currently adding for:</p>
            <p className="text-lg font-medium">{format(currentDate, "MMMM d, yyyy")}</p>
            <p className="text-sm text-muted-foreground mt-2">Go to the main calendar to change date</p>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="notes" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="tracking">Shift Swaps</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notes" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Note</CardTitle>
              <CardDescription>
                Create a note for {format(currentDate, "MMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note-text">Note</Label>
                <Textarea
                  id="note-text"
                  placeholder="Enter your note here..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
              </div>
              
              <Button onClick={saveNote} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Save Note
              </Button>
            </CardContent>
          </Card>
          
          <div className="space-y-3">
            <h3 className="font-medium">Your Notes</h3>
            
            {/* Always show all folders, even if empty */}
            {Object.entries(categorizedItems)
              .filter(([key]) => key === "notes" || key === "toil" || key === "calendar-notes")
              .map(([key, items]) => (
                <Collapsible 
                  key={key} 
                  open={openFolders[key]} 
                  onOpenChange={() => toggleFolder(key)}
                  className="border rounded-md overflow-hidden"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50">
                    <div className="flex items-center">
                      <FolderOpen className="mr-2 h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{getFolderName(key)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="border-t">
                    <div className="p-1 space-y-1">
                      {items.length > 0 ? (
                        items.map((item, idx) => (
                          <Card key={idx} className="shadow-none border">
                            <CardContent className="p-3">
                              <div className="flex items-center text-sm text-muted-foreground mb-2">
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {format(new Date(item.date), "MMMM d, yyyy")}
                              </div>
                              <p className="whitespace-pre-line">{item.text}</p>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-4">No items in this folder</p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="tracking" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Record Shift Swap</CardTitle>
              <CardDescription>
                Track shift swaps for {format(currentDate, "MMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="swap-type">Swap Type</Label>
                <div className="flex rounded-md overflow-hidden">
                  <Button
                    type="button"
                    variant={swapType === "owed" ? "default" : "outline"}
                    className={`flex-1 rounded-r-none ${swapType === "owed" ? "" : "border-r-0"}`}
                    onClick={() => setSwapType("owed")}
                  >
                    I Owe Time
                  </Button>
                  <Button
                    type="button"
                    variant={swapType === "payback" ? "default" : "outline"}
                    className={`flex-1 rounded-l-none ${swapType === "payback" ? "" : "border-l-0"}`}
                    onClick={() => setSwapType("payback")}
                  >
                    I'm Owed Time
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="swap-worker">Worker Name</Label>
                <Input
                  id="swap-worker"
                  placeholder="Enter colleague name"
                  value={swapWorkerName}
                  onChange={(e) => setSwapWorkerName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="swap-hours">Hours</Label>
                <Input
                  id="swap-hours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  placeholder="Number of hours"
                  value={swapHours}
                  onChange={(e) => setSwapHours(e.target.value)}
                />
              </div>
              
              <Button onClick={saveSwap} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Record Swap
              </Button>
            </CardContent>
          </Card>
          
          <div className="space-y-2">
            <h3 className="font-medium">Shift Swaps</h3>
            
            {/* Always show swap folders, even if empty */}
            {Object.entries(categorizedItems)
              .filter(([key]) => key === "swap-done" || key === "swap-owed")
              .map(([key, items]) => (
                <Collapsible 
                  key={key} 
                  open={openFolders[key]} 
                  onOpenChange={() => toggleFolder(key)}
                  className="border rounded-md overflow-hidden mb-2"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50">
                    <div className="flex items-center">
                      <FolderOpen className="mr-2 h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{getFolderName(key)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {items.length} item{items.length !== 1 ? 's' : ''}
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="border-t">
                    <div className="p-1 space-y-1">
                      {items.length > 0 ? (
                        items.map((swap, index) => (
                          <Card key={index} className="shadow-none border">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-muted-foreground mb-2">
                                  <CalendarDays className="mr-2 h-4 w-4" />
                                  {format(new Date(swap.date), "MMMM d, yyyy")}
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs ${
                                  key === "swap-done" 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                }`}>
                                  {key === "swap-done" ? "Owed to You" : "You Owe"}
                                </div>
                              </div>
                              <div className="flex items-center mt-2">
                                <ArrowLeftRight className="mr-2 h-4 w-4" />
                                <span className="font-medium">{swap.workerName}</span>
                              </div>
                              <div className="flex items-center mt-1">
                                <Clock className="mr-2 h-4 w-4" />
                                <span>{swap.hours} hour{swap.hours !== 1 ? "s" : ""}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-4">No items in this folder</p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotesTracking;
