
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Search, Plus, Clock, ArrowLeftRight, CalendarDays } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Note, ShiftSwap, SwapType } from "@/types/calendar";

const NotesTracking = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("notes");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [swaps, setSwaps] = useState<ShiftSwap[]>([]);
  const [swapWorkerName, setSwapWorkerName] = useState("");
  const [swapHours, setSwapHours] = useState("");
  const [swapType, setSwapType] = useState<SwapType>("owed");
  const [searchTerm, setSearchTerm] = useState("");

  // Load notes and swaps from localStorage
  useState(() => {
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
  });

  const saveNote = () => {
    if (!selectedDate) {
      toast({
        title: "No date selected",
        description: "Please select a date for your note",
        variant: "destructive",
      });
      return;
    }

    if (!noteText.trim()) {
      toast({
        title: "Empty note",
        description: "Please enter some text for your note",
        variant: "destructive",
      });
      return;
    }

    const dateString = format(selectedDate, "yyyy-MM-dd");
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
      description: `Note added for ${format(selectedDate, "MMM d, yyyy")}`,
    });
  };

  const saveSwap = () => {
    if (!selectedDate) {
      toast({
        title: "No date selected",
        description: "Please select a date for this shift swap",
        variant: "destructive",
      });
      return;
    }

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

    const dateString = format(selectedDate, "yyyy-MM-dd");
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

  const filteredNotes = notes.filter(note => 
    note.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.date.includes(searchTerm)
  );

  const filteredSwaps = swaps.filter(swap => 
    swap.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    swap.date.includes(searchTerm)
  );

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
                Create a note for a specific date
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note-date">Date</Label>
                <div className="border rounded-md p-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="mx-auto"
                  />
                </div>
              </div>
              
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
          
          {filteredNotes.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-medium">Your Notes</h3>
              {filteredNotes.map((note, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {format(new Date(note.date), "MMMM d, yyyy")}
                    </div>
                    <p>{note.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            searchTerm ? (
              <p className="text-center text-muted-foreground py-8">No notes found</p>
            ) : (
              <p className="text-center text-muted-foreground py-8">You don't have any notes yet</p>
            )
          )}
        </TabsContent>
        
        <TabsContent value="tracking" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Record Shift Swap</CardTitle>
              <CardDescription>
                Track shift swaps with your colleagues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="swap-date">Date</Label>
                <div className="border rounded-md p-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="mx-auto"
                  />
                </div>
              </div>
              
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
          
          {filteredSwaps.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-medium">Shift Swaps</h3>
              {filteredSwaps.map((swap, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {format(new Date(swap.date), "MMMM d, yyyy")}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${swap.type === "owed" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"}`}>
                        {swap.type === "owed" ? "You Owe" : "Owed to You"}
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
              ))}
            </div>
          ) : (
            searchTerm ? (
              <p className="text-center text-muted-foreground py-8">No shift swaps found</p>
            ) : (
              <p className="text-center text-muted-foreground py-8">You don't have any shift swaps yet</p>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotesTracking;
