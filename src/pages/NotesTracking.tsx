
import React, { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import {
  ShiftSwap,
  Note as NoteType,
  TOILType
} from "@/types/calendar";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { addDays, isToday, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { format as dateFnsFormat } from 'date-fns';
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type NoteContent = {
  type: 'text' | 'list';
  value: string | string[];
};

type Note = {
  date: string;
  header: string;
  content: NoteContent[];
  swap?: ShiftSwap;
  toilType?: TOILType;
  toilHours?: number;
  isToilDone?: boolean;
  isToilTaken?: boolean;
};

type ExtendedNote = Note & {
  id: string;
  text?: string;
};

// DateRangePicker component
interface DateRangePickerProps {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

const DateRangePicker = ({ date, onDateChange }: DateRangePickerProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <Label>Filter by date range</Label>
      <div className="grid grid-cols-2 gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                format(date.from, "PPP")
              ) : (
                <span>Start date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date?.from}
              onSelect={(day) => {
                if (day) {
                  onDateChange({ from: day, to: date?.to });
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.to ? (
                format(date.to, "PPP")
              ) : (
                <span>End date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date?.to}
              onSelect={(day) => {
                if (day) {
                  onDateChange({ from: date?.from, to: day });
                }
              }}
              initialFocus
              disabled={(date) => date < (date?.from || new Date())}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            const today = new Date();
            onDateChange({ from: today, to: today });
          }}
        >
          Today
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            const today = new Date();
            const lastWeek = subDays(today, 7);
            onDateChange({ from: lastWeek, to: today });
          }}
        >
          Last 7 days
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            const today = new Date();
            const lastMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            onDateChange({ from: lastMonth, to: today });
          }}
        >
          This month
        </Button>
      </div>
    </div>
  );
};

const NotesTracking = () => {
  const [notes, setNotes] = useState<ExtendedNote[]>(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [header, setHeader] = useState('');
  const [content, setContent] = useState<NoteContent[]>([{ type: 'text', value: '' }]);
  const [selectedNote, setSelectedNote] = useState<ExtendedNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isToil, setIsToil] = useState(false);
  const [toilType, setToilType] = useState<TOILType | undefined>(undefined);
  const [toilHours, setToilHours] = useState<number | undefined>(undefined);
  const [isToilDone, setIsToilDone] = useState(false);
  const [isToilTaken, setIsToilTaken] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })
  const { toast } = useToast()
  const { theme } = useTheme();

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
  };

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeader(e.target.value);
  };

  const handleContentChange = (index: number, type: 'text' | 'list', value: string | string[]) => {
    setContent(prevContent => {
      const newContent = [...prevContent];
      newContent[index] = { type, value };
      return newContent;
    });
  };

  const addContentItem = () => {
    setContent(prevContent => [...prevContent, { type: 'text', value: '' }]);
  };

  const removeContentItem = (index: number) => {
    setContent(prevContent => prevContent.filter((_, i) => i !== index));
  };

  const handleNoteSubmit = () => {
    if (!date) {
      alert('Please select a date.');
      return;
    }

    if (isToil && (!toilType || !toilHours)) {
      alert('Please select TOIL type and hours.');
      return;
    }

    const newNote: Note = {
      date: date.toISOString(),
      header: header,
      content: content,
      toilType: isToil ? toilType : undefined,
      toilHours: isToil ? toilHours : undefined,
      isToilDone: isToil ? isToilDone : undefined,
      isToilTaken: isToil ? isToilTaken : undefined,
    };

    setNotes(prevNotes => {
      if (selectedNote && isEditing) {
        // Update existing note
        return prevNotes.map(note =>
          note.id === selectedNote.id ? { ...newNote, id: selectedNote.id } : note
        );
      } else {
        // Add new note
        return [...prevNotes, { ...newNote, id: Date.now().toString() }];
      }
    });

    // Reset form
    setDate(undefined);
    setHeader('');
    setContent([{ type: 'text', value: '' }]);
    setSelectedNote(null);
    setIsEditing(false);
    setIsToil(false);
    setToilType(undefined);
    setToilHours(undefined);
    setIsToilDone(false);
    setIsToilTaken(false);

    toast({
      title: isEditing ? "Note updated." : "Note added.",
    })
  };

  const handleNoteEdit = (note: ExtendedNote) => {
    setDate(parseISO(note.date));
    setHeader(note.header);
    setContent(note.content);
    setSelectedNote(note);
    setIsEditing(true);
    setIsToil(note.toilType !== undefined);
    setToilType(note.toilType);
    setToilHours(note.toilHours);
    setIsToilDone(note.isToilDone || false);
    setIsToilTaken(note.isToilTaken || false);
  };

  const handleNoteDelete = (note: ExtendedNote) => {
    setNotes(prevNotes => {
      const noteIndex = findOriginalNoteIndex(note);
      if (noteIndex > -1) {
        const newNotes = [...prevNotes];
        newNotes.splice(noteIndex, 1);
        return newNotes;
      }
      return prevNotes;
    });

    toast({
      title: "Note deleted.",
    })
  };

  // Find original index of a note in the overall notes array
  const findOriginalNoteIndex = (note: ExtendedNote): number => {
    return notes.findIndex(n => {
      // For TOIL entries, compare only essential TOIL-specific fields
      if (note.toilHours || getNoteText(note).toLowerCase().includes("toil")) {
        return n.date === note.date && 
               n.toilHours === note.toilHours &&
               n.toilType === note.toilType;
      }
      
      // For regular notes, compare all fields
      return n.date === note.date && 
             n.text === note.text && 
             n.header === note.header &&
             JSON.stringify(n.content) === JSON.stringify(n.content) &&
             JSON.stringify(n.swap) === JSON.stringify(n.swap);
    });
  };

  const getNoteText = (note: ExtendedNote): string => {
    return note.content.map(item => {
      if (item.type === 'text') {
        return item.value;
      } else if (item.type === 'list') {
        return (item.value as string[]).join('\n');
      }
      return '';
    }).join('\n');
  };

  const filteredNotes = notes.filter(note => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const noteDate = parseISO(note.date);
    return noteDate >= dateRange.from && noteDate <= (dateRange.to);
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Notes Tracking</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes Form */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Note' : 'Add Note'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? dateFnsFormat(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    disabled={(date) =>
                      date > addDays(new Date(), 0)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="header">Header</Label>
              <Input id="header" value={header} onChange={handleHeaderChange} />
            </div>
            <div>
              <Label>Content</Label>
              {content.map((item, index) => (
                <div key={index} className="mb-2">
                  <Textarea
                    value={item.type === 'text' ? item.value as string : (item.value as string[]).join('\n')}
                    onChange={(e) => handleContentChange(index, 'text', e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-end mt-1">
                    <Button type="button" variant="outline" size="sm" onClick={() => removeContentItem(index)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="secondary" size="sm" onClick={addContentItem}>
                Add Content
              </Button>
            </div>

            <Separator className="my-4" />

            <div>
              <Label htmlFor="isToil" className="flex items-center space-x-2">
                <span>Is TOIL?</span>
                <Switch id="isToil" checked={isToil} onCheckedChange={setIsToil} />
              </Label>
            </div>

            {isToil && (
              <div className="space-y-2">
                <div>
                  <Label htmlFor="toilType">TOIL Type</Label>
                  <Select value={toilType} onValueChange={(value) => setToilType(value as TOILType)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select TOIL Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="taken">Taken</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="toilHours">TOIL Hours</Label>
                  <Slider
                    defaultValue={[toilHours || 0]}
                    max={12}
                    step={0.5}
                    onValueChange={(value) => setToilHours(value[0])}
                  />
                  <p className="text-sm text-muted-foreground">
                    {toilHours} hours
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="isToilDone">Is TOIL Done?</Label>
                  <Switch id="isToilDone" checked={isToilDone} onCheckedChange={setIsToilDone} />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="isToilTaken">Is TOIL Taken?</Label>
                  <Switch id="isToilTaken" checked={isToilTaken} onCheckedChange={setIsToilTaken} />
                </div>
              </div>
            )}

            <Button onClick={handleNoteSubmit}>{isEditing ? 'Update Note' : 'Add Note'}</Button>
          </CardContent>
        </Card>

        {/* Notes List */}
        <Card>
          <CardHeader>
            <CardTitle>Notes List</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <DateRangePicker date={dateRange} onDateChange={setDateRange} />
            </div>
            <Table>
              <TableCaption>A list of your notes.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Header</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium">{format(parseISO(note.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{note.header}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleNoteEdit(note)}>
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your note from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleNoteDelete(note)}>Continue</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotesTracking;
