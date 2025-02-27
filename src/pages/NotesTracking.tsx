
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Search, Plus, Clock, ArrowLeftRight, CalendarDays, FolderOpen, Pencil, Trash2, Image, Camera, ChevronDown, CheckCircle2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Note, ShiftSwap, SwapType } from "@/types/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

// Extended Note type to include header and content blocks
interface ExtendedNote extends Note {
  header?: string;
  content?: ContentBlock[];
  imageUrl?: string; // Add imageUrl for legacy support
}

// Extended ShiftSwap type to include completion status and images
interface ExtendedShiftSwap extends ShiftSwap {
  isCompleted?: boolean;
  images?: string[]; // Array of image data URLs
}

// Content block can be either text or image
interface ContentBlock {
  type: 'text' | 'image';
  content: string;
}

const NotesTracking = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("notes");
  const [noteHeader, setNoteHeader] = useState("");
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<ExtendedNote[]>([]);
  const [noteContent, setNoteContent] = useState<ContentBlock[]>([{type: 'text', content: ''}]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const swapFileInputRef = useRef<HTMLInputElement>(null);
  const [swaps, setSwaps] = useState<ExtendedShiftSwap[]>([]);
  const [swapWorkerName, setSwapWorkerName] = useState("");
  const [swapHours, setSwapHours] = useState("");
  const [swapType, setSwapType] = useState<SwapType>("owed");
  const [swapImages, setSwapImages] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentDate] = useState(new Date());
  const [selectedSwapDate, setSelectedSwapDate] = useState<Date>(new Date());
  const [swapFormOpen, setSwapFormOpen] = useState(false);
  const [noteFormOpen, setNoteFormOpen] = useState(false);
  
  // For image preview modal
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  
  // Expanded swap cards
  const [expandedSwaps, setExpandedSwaps] = useState<Record<string, boolean>>({});
  
  // Start with all folders closed
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    "swap-done": false,
    "swap-owed": false,
    "toil": false,
    "notes": false,
    "calendar-notes": false
  });
  
  // For edit and delete functionality
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'note' | 'swap', index: number } | null>(null);
  const [editNoteHeader, setEditNoteHeader] = useState("");
  const [editNoteContent, setEditNoteContent] = useState<ContentBlock[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editSwapFileInputRef = useRef<HTMLInputElement>(null);
  const [editSwapWorkerName, setEditSwapWorkerName] = useState("");
  const [editSwapHours, setEditSwapHours] = useState("");
  const [editSwapType, setEditSwapType] = useState<SwapType>("owed");
  const [editSwapImages, setEditSwapImages] = useState<string[]>([]);
  const [editIsSwapCompleted, setEditIsSwapCompleted] = useState(false);
  
  // Open image preview
  const handleImageClick = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setImagePreviewOpen(true);
  };

  // Toggle swap expansion
  const toggleSwapExpansion = (swapId: string) => {
    setExpandedSwaps(prev => ({
      ...prev,
      [swapId]: !prev[swapId]
    }));
  };
  
  // Load notes and swaps from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        
        // Convert old format notes to new format
        const convertedNotes = parsed.map((note: any) => {
          if (note.content) {
            return note; // Already in new format
          } else {
            // Convert old format to new format
            const newNote: ExtendedNote = {
              ...note,
              content: [
                ...(note.text ? [{type: 'text', content: note.text}] : []),
                ...(note.imageUrl ? [{type: 'image', content: note.imageUrl}] : [])
              ]
            };
            return newNote;
          }
        });
        
        setNotes(convertedNotes);
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

  // Handle swap completion toggle - memoized with useCallback to avoid recreation
  const toggleSwapCompletion = useCallback((index: number) => {
    setSwaps(currentSwaps => {
      const updatedSwaps = [...currentSwaps];
      updatedSwaps[index] = {
        ...updatedSwaps[index],
        isCompleted: !updatedSwaps[index].isCompleted
      };
      
      // Save to localStorage
      localStorage.setItem("swaps", JSON.stringify(updatedSwaps));
      
      // We'll show a toast directly in the component instead of here
      return updatedSwaps;
    });
  }, []);

  // Handle image upload for notes
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Add a new image block
        setNoteContent(prev => [
          ...prev,
          { type: 'image', content: reader.result as string },
          { type: 'text', content: '' } // Add a new text block after image
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload for swaps
  const handleSwapImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSwapImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload for swap edits
  const handleEditSwapImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditSwapImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove swap image
  const removeSwapImage = (index: number) => {
    setSwapImages(prev => prev.filter((_, i) => i !== index));
  };

  // Remove edit swap image
  const removeEditSwapImage = (index: number) => {
    setEditSwapImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle camera capture for notes
  const handleCameraCapture = async () => {
    try {
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Camera not supported",
          description: "Your browser doesn't support camera access",
          variant: "destructive",
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Create video and canvas elements
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Take picture after a short delay
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Stop all video streams
        stream.getTracks().forEach(track => track.stop());
        
        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL('image/png');
        
        // Add a new image block
        setNoteContent(prev => [
          ...prev,
          { type: 'image', content: imageDataUrl },
          { type: 'text', content: '' } // Add a new text block after image
        ]);
        
        toast({
          title: "Image captured",
          description: "Camera image added to note",
        });
      }, 500);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  // Handle camera capture for swaps
  const handleSwapCameraCapture = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Camera not supported",
          description: "Your browser doesn't support camera access",
          variant: "destructive",
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        stream.getTracks().forEach(track => track.stop());
        const imageDataUrl = canvas.toDataURL('image/png');
        
        setSwapImages(prev => [...prev, imageDataUrl]);
        
        toast({
          title: "Image captured",
          description: "Camera image added to swap record",
        });
      }, 500);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  // Handle camera capture for swap edits
  const handleEditSwapCameraCapture = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Camera not supported",
          description: "Your browser doesn't support camera access",
          variant: "destructive",
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        stream.getTracks().forEach(track => track.stop());
        const imageDataUrl = canvas.toDataURL('image/png');
        
        setEditSwapImages(prev => [...prev, imageDataUrl]);
        
        toast({
          title: "Image captured",
          description: "Camera image added to swap record",
        });
      }, 500);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  // Handle edit image upload
  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        // Add a new image block after the current text block
        const newContent = [...editNoteContent];
        newContent.splice(index + 1, 0, { type: 'image', content: imageUrl });
        // Add a new text block after the image
        newContent.splice(index + 2, 0, { type: 'text', content: '' });
        setEditNoteContent(newContent);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle edit camera capture
  const handleEditCameraCapture = async (index: number) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Camera not supported",
          description: "Your browser doesn't support camera access",
          variant: "destructive",
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        stream.getTracks().forEach(track => track.stop());
        
        const imageDataUrl = canvas.toDataURL('image/png');
        
        // Add a new image block after the current text block
        const newContent = [...editNoteContent];
        newContent.splice(index + 1, 0, { type: 'image', content: imageDataUrl });
        // Add a new text block after the image
        newContent.splice(index + 2, 0, { type: 'text', content: '' });
        setEditNoteContent(newContent);
        
        toast({
          title: "Image captured",
          description: "Camera image added to note",
        });
      }, 500);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  // Update text content at a specific index
  const updateNoteTextContent = (index: number, value: string) => {
    const newContent = [...noteContent];
    if (newContent[index].type === 'text') {
      newContent[index].content = value;
      setNoteContent(newContent);
    }
  };

  // Update edit text content at a specific index
  const updateEditNoteTextContent = (index: number, value: string) => {
    const newContent = [...editNoteContent];
    if (newContent[index].type === 'text') {
      newContent[index].content = value;
      setEditNoteContent(newContent);
    }
  };

  // Remove a content block
  const removeContentBlock = (index: number) => {
    const newContent = [...noteContent];
    newContent.splice(index, 1);
    // Make sure we have at least one text block
    if (newContent.length === 0 || newContent.every(block => block.type !== 'text')) {
      newContent.push({ type: 'text', content: '' });
    }
    setNoteContent(newContent);
  };

  // Remove an edit content block
  const removeEditContentBlock = (index: number) => {
    const newContent = [...editNoteContent];
    newContent.splice(index, 1);
    // Make sure we have at least one text block
    if (newContent.length === 0 || newContent.every(block => block.type !== 'text')) {
      newContent.push({ type: 'text', content: '' });
    }
    setEditNoteContent(newContent);
  };

  const saveNote = () => {
    // Filter out empty content blocks at the end
    const filteredContent = [...noteContent];
    while (
      filteredContent.length > 0 && 
      filteredContent[filteredContent.length - 1].type === 'text' && 
      filteredContent[filteredContent.length - 1].content.trim() === ''
    ) {
      filteredContent.pop();
    }
    
    // Check if note is empty (no text content and no images)
    const hasText = filteredContent.some(block => block.type === 'text' && block.content.trim() !== '');
    const hasImages = filteredContent.some(block => block.type === 'image');
    
    if (!hasText && !hasImages) {
      toast({
        title: "Empty note",
        description: "Please enter some text or add an image for your note",
        variant: "destructive",
      });
      return;
    }

    const dateString = format(currentDate, "yyyy-MM-dd");
    const newNote: ExtendedNote = {
      date: dateString,
      text: filteredContent.filter(block => block.type === 'text').map(block => block.content).join('\n\n'),
      header: noteHeader.trim() || undefined,
      content: filteredContent.length > 0 ? filteredContent : undefined,
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
    
    // Reset form
    setNoteHeader("");
    setNoteContent([{type: 'text', content: ''}]);
    setNoteFormOpen(false);
    
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

    const dateString = format(selectedSwapDate, "yyyy-MM-dd");
    
    const newSwap: ExtendedShiftSwap = {
      date: dateString,
      workerName: swapWorkerName,
      type: swapType,
      hours: parseFloat(swapHours),
      note: `Created on ${format(new Date(), "MMM d, yyyy")}`,
      images: swapImages.length > 0 ? swapImages : undefined,
      isCompleted: false,
    };

    const updatedSwaps = [...swaps, newSwap];
    setSwaps(updatedSwaps);
    localStorage.setItem("swaps", JSON.stringify(updatedSwaps));
    
    // Reset form
    setSwapWorkerName("");
    setSwapHours("");
    setSelectedSwapDate(new Date());
    setSwapImages([]);
    setSwapFormOpen(false);
    
    toast({
      title: "Shift swap recorded",
      description: `${swapHours} hours with ${swapWorkerName}`,
    });
  };

  // Handle Delete Item
  const handleDeleteClick = (type: 'note' | 'swap', index: number) => {
    setSelectedItem({ type, index });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedItem) return;
    
    // Close dialog first for immediate visual feedback
    setDeleteDialogOpen(false);
    
    if (selectedItem.type === 'note') {
      const updatedNotes = [...notes];
      updatedNotes.splice(selectedItem.index, 1);
      setNotes(updatedNotes);
      localStorage.setItem("notes", JSON.stringify(updatedNotes));
      
      toast({
        title: "Note deleted",
        description: "Note has been permanently removed",
      });
    } else {
      const updatedSwaps = [...swaps];
      updatedSwaps.splice(selectedItem.index, 1);
      setSwaps(updatedSwaps);
      localStorage.setItem("swaps", JSON.stringify(updatedSwaps));
      
      toast({
        title: "Shift swap deleted",
        description: "Shift swap record has been permanently removed",
      });
    }
    
    setSelectedItem(null);
  };

  // Handle Edit Item
  const handleEditClick = (type: 'note' | 'swap', index: number) => {
    setSelectedItem({ type, index });
    
    if (type === 'note') {
      const note = notes[index] as ExtendedNote;
      setEditNoteHeader(note.header || "");
      
      // Convert note to content blocks format
      if (note.content) {
        setEditNoteContent(note.content);
      } else {
        // Legacy format conversion
        const blocks: ContentBlock[] = [];
        if (note.text) {
          blocks.push({ type: 'text', content: note.text });
        }
        if (note.imageUrl) {
          blocks.push({ type: 'image', content: note.imageUrl });
        }
        // Ensure there's at least one text block
        if (blocks.length === 0 || blocks.every(block => block.type !== 'text')) {
          blocks.push({ type: 'text', content: '' });
        }
        setEditNoteContent(blocks);
      }
    } else {
      const swap = swaps[index];
      setEditSwapWorkerName(swap.workerName);
      setEditSwapHours(swap.hours.toString());
      setEditSwapType(swap.type);
      setEditIsSwapCompleted(swap.isCompleted || false);
      setEditSwapImages(swap.images || []);
    }
    
    setEditDialogOpen(true);
  };

  const confirmEdit = () => {
    if (!selectedItem) return;
    
    // Close dialog first for immediate visual feedback
    setEditDialogOpen(false);
    
    if (selectedItem.type === 'note') {
      // Filter out empty content blocks at the end
      const filteredContent = [...editNoteContent];
      while (
        filteredContent.length > 0 && 
        filteredContent[filteredContent.length - 1].type === 'text' && 
        filteredContent[filteredContent.length - 1].content.trim() === ''
      ) {
        filteredContent.pop();
      }
      
      // Check if note is empty (no text content and no images)
      const hasText = filteredContent.some(block => block.type === 'text' && block.content.trim() !== '');
      const hasImages = filteredContent.some(block => block.type === 'image');
      
      if (!hasText && !hasImages) {
        toast({
          title: "Empty note",
          description: "Please enter some text or add an image for your note",
          variant: "destructive",
        });
        return;
      }
      
      const updatedNotes = [...notes];
      updatedNotes[selectedItem.index] = {
        ...updatedNotes[selectedItem.index],
        header: editNoteHeader.trim() || undefined,
        text: filteredContent.filter(block => block.type === 'text').map(block => block.content).join('\n\n'),
        content: filteredContent.length > 0 ? filteredContent : undefined,
      };
      
      setNotes(updatedNotes);
      localStorage.setItem("notes", JSON.stringify(updatedNotes));
      
      toast({
        title: "Note updated",
        description: "Your note has been successfully updated",
      });
    } else {
      if (!editSwapWorkerName.trim()) {
        toast({
          title: "No name provided",
          description: "Please enter the name of the person you swapped with",
          variant: "destructive",
        });
        return;
      }

      if (!editSwapHours || isNaN(parseFloat(editSwapHours)) || parseFloat(editSwapHours) <= 0) {
        toast({
          title: "Invalid hours",
          description: "Please enter a valid number of hours",
          variant: "destructive",
        });
        return;
      }
      
      const updatedSwaps = [...swaps];
      updatedSwaps[selectedItem.index] = {
        ...updatedSwaps[selectedItem.index],
        workerName: editSwapWorkerName,
        hours: parseFloat(editSwapHours),
        type: editSwapType,
        isCompleted: editIsSwapCompleted,
        images: editSwapImages.length > 0 ? editSwapImages : updatedSwaps[selectedItem.index].images,
      };
      
      setSwaps(updatedSwaps);
      localStorage.setItem("swaps", JSON.stringify(updatedSwaps));
      
      toast({
        title: "Shift swap updated",
        description: "Shift swap record has been successfully updated",
      });
    }
    
    setSelectedItem(null);
  };

  // Helper function to get text from a note for searching and categorizing
  const getNoteText = (note: ExtendedNote): string => {
    if (note.content) {
      return note.content
        .filter(block => block.type === 'text')
        .map(block => block.content)
        .join(' ');
    }
    return note.text || '';
  };

  // Filter notes and swaps based on search term
  const filteredNotes = notes.filter(note => {
    const noteText = getNoteText(note);
    return (
      noteText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.header && note.header.toLowerCase().includes(searchTerm.toLowerCase())) ||
      note.date.includes(searchTerm)
    );
  });

  const filteredSwaps = swaps.filter(swap => 
    swap.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    swap.date.includes(searchTerm)
  );

  // Categorize notes and swaps
  const categorizedItems = {
    "swap-done": filteredSwaps.filter(swap => swap.type === "payback"),
    "swap-owed": filteredSwaps.filter(swap => swap.type === "owed"),
    "toil": filteredNotes.filter(note => getNoteText(note).toLowerCase().includes("toil")),
    "notes": filteredNotes.filter(note => {
      const text = getNoteText(note);
      return !text.toLowerCase().includes("toil") && !text.toLowerCase().includes("swap") && !note.swap;
    }),
    "calendar-notes": filteredNotes.filter(note => note.swap)
  };

  // When searching, open folders with matching results
  useEffect(() => {
    if (searchTerm) {
      // Create a copy of the current open folders state
      const newOpenFolders = { ...openFolders };
      
      // Open folders that have matches
      Object.entries(categorizedItems).forEach(([key, items]) => {
        if (items.length > 0) {
          newOpenFolders[key] = true;
        }
      });
      
      setOpenFolders(newOpenFolders);
    }
  }, [searchTerm, categorizedItems]);

  // Toggle folder open/closed state
  const toggleFolder = (folder: string) => {
    setOpenFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
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
  
  // Find original index of a note in the overall notes array
  const findOriginalNoteIndex = (note: ExtendedNote): number => {
    return notes.findIndex(n => 
      n.date === note.date && 
      n.text === note.text && 
      n.header === n.header &&
      JSON.stringify(n.content) === JSON.stringify(n.content) &&
      JSON.stringify(n.swap) === JSON.stringify(n.swap)
    );
  };
  
  // Find original index of a swap in the overall swaps array
  const findOriginalSwapIndex = (swap: ExtendedShiftSwap): number => {
    return swaps.findIndex(s => 
      s.date === swap.date && 
      s.workerName === swap.workerName && 
      s.hours === swap.hours && 
      s.type === swap.type
    );
  };

  // Generate a unique ID for a swap to use in the expandedSwaps state
  const getSwapId = (swap: ExtendedShiftSwap, index: number): string => {
    return `${swap.date}-${swap.workerName}-${index}`;
  };

  // Render a note in view mode
  const renderNoteContent = (note: ExtendedNote) => {
    if (note.content) {
      return note.content.map((block, index) => (
        <div key={index} className={`mb-3 ${block.type === 'image' ? 'image-block' : 'text-block'}`}>
          {block.type === 'image' ? (
            <img 
              src={block.content} 
              alt={`Note attachment ${index}`} 
              className="max-h-[200px] w-auto object-contain rounded-md border cursor-pointer"
              onClick={() => handleImageClick(block.content)}
            />
          ) : (
            <p className="whitespace-pre-line">{block.content}</p>
          )}
        </div>
      ));
    } else {
      // Legacy format
      return (
        <>
          {note.imageUrl && (
            <div className="mb-3">
              <img 
                src={note.imageUrl} 
                alt="Note attachment" 
                className="max-h-[200px] w-auto object-contain rounded-md border my-2 cursor-pointer" 
                onClick={() => handleImageClick(note.imageUrl || '')}
              />
            </div>
          )}
          <p className="whitespace-pre-line">{note.text}</p>
        </>
      );
    }
  };

  // Handle swap status toggle directly
  const handleSwapStatusToggle = (index: number) => {
    toggleSwapCompletion(index);
    // Add immediate visual feedback
    const swap = swaps[index];
    toast({
      title: !swap.isCompleted ? "Swap marked as done" : "Swap marked as pending",
      description: `Swap with ${swap.workerName} has been updated`,
    });
  };

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
        <TabsList className="grid w-full grid-cols-2 mb-2 h-12">
          <TabsTrigger value="notes" className="py-3">Notes</TabsTrigger>
          <TabsTrigger value="tracking" className="py-3">Shift Swap / TOIL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notes" className="space-y-4 mt-4">
          {/* Collapsible Note Form */}
          <Collapsible 
            open={noteFormOpen} 
            onOpenChange={setNoteFormOpen}
            className="border rounded-md overflow-hidden mb-4"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50">
              <div className="flex items-center">
                <Plus className="mr-2 h-5 w-5 text-primary" />
                <span className="font-medium">Add Note</span>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transform transition-transform ${noteFormOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note-header">Header</Label>
                  <Input
                    id="note-header"
                    placeholder="Enter note header..."
                    value={noteHeader}
                    onChange={(e) => setNoteHeader(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Content</Label>
                  <div className="space-y-3">
                    {noteContent.map((block, index) => (
                      <div key={index} className="relative">
                        {block.type === 'text' ? (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Enter your note here..."
                              value={block.content}
                              onChange={(e) => updateNoteTextContent(index, e.target.value)}
                              className="min-h-[100px]"
                            />
                            <div className="flex gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id={`note-image-upload-${index}`}
                                ref={index === noteContent.length - 1 ? fileInputRef : null}
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => document.getElementById(`note-image-upload-${index}`)?.click()}
                              >
                                <Image className="mr-2 h-4 w-4" />
                                Add Image
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="flex-1"
                                onClick={handleCameraCapture}
                              >
                                <Camera className="mr-2 h-4 w-4" />
                                Camera
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <img 
                              src={block.content} 
                              alt={`Note attachment ${index}`} 
                              className="max-h-[200px] w-auto object-contain rounded-md border"
                            />
                            <Button 
                              onClick={() => removeContentBlock(index)} 
                              variant="destructive" 
                              size="sm" 
                              className="absolute top-2 right-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button onClick={saveNote} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Save Note
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <div className="space-y-3">
            <h3 className="font-medium">Your Notes</h3>
            
            {/* Show only regular notes and calendar notes in this tab */}
            {Object.entries(categorizedItems)
              .filter(([key]) => key === "notes" || key === "calendar-notes")
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
                        items.map((item, idx) => {
                          const note = item as ExtendedNote;
                          return (
                            <Card key={idx} className="shadow-none border">
                              <CardContent className="p-3">
                                <div className="flex items-center text-sm text-muted-foreground mb-2">
                                  <CalendarDays className="mr-2 h-4 w-4" />
                                  {format(new Date(note.date), "MMMM d, yyyy")}
                                </div>
                                
                                {note.header && (
                                  <h4 className="text-base font-semibold mb-2">{note.header}</h4>
                                )}
                                
                                {renderNoteContent(note)}
                              </CardContent>
                              <CardFooter className="p-2 pt-0 flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditClick('note', findOriginalNoteIndex(note))}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-destructive hover:text-destructive/90"
                                  onClick={() => handleDeleteClick('note', findOriginalNoteIndex(note))}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </CardFooter>
                            </Card>
                          );
                        })
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
          {/* Collapsible Shift Swap Form */}
          <Collapsible 
            open={swapFormOpen} 
            onOpenChange={setSwapFormOpen}
            className="border rounded-md overflow-hidden mb-4"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50">
              <div className="flex items-center">
                <Plus className="mr-2 h-5 w-5 text-primary" />
                <span className="font-medium">Record Shift Swap</span>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transform transition-transform ${swapFormOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t">
              <div className="p-4 space-y-4">
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
                
                <div className="space-y-2">
                  <Label htmlFor="swap-date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {format(selectedSwapDate, "MMMM d, yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedSwapDate}
                        onSelect={(date) => date && setSelectedSwapDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Swap Type</Label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${swapType === "owed" ? "text-foreground font-medium" : "text-muted-foreground"}`}>You Owe</span>
                      <Switch 
                        checked={swapType === "payback"}
                        onCheckedChange={(checked) => setSwapType(checked ? "payback" : "owed")}
                      />
                      <span className={`text-sm ${swapType === "payback" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Owed to You</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Images (Optional)</Label>
                  
                  {swapImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {swapImages.map((image, i) => (
                        <div key={i} className="relative rounded-md overflow-hidden border">
                          <img 
                            src={image} 
                            alt={`Swap image ${i+1}`} 
                            className="w-full h-24 object-cover"
                          />
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => removeSwapImage(i)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSwapImageUpload}
                      className="hidden"
                      id="swap-image-upload"
                      ref={swapFileInputRef}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => document.getElementById("swap-image-upload")?.click()}
                    >
                      <Image className="mr-2 h-4 w-4" />
                      Add Image
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleSwapCameraCapture}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Camera
                    </Button>
                  </div>
                </div>
                
                <Button onClick={saveSwap} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Record Swap
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <div className="space-y-3">
            <h3 className="font-medium">Shift Swaps & TOIL</h3>
            
            {/* Show swap folders and TOIL folder in this tab */}
            {Object.entries(categorizedItems)
              .filter(([key]) => key === "swap-done" || key === "swap-owed" || key === "toil")
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
                        items.map((item, idx) => {
                          if ('workerName' in item) {
                            // This is a shift swap
                            const swap = item as ExtendedShiftSwap;
                            const swapIndex = findOriginalSwapIndex(swap);
                            const swapKey = key;
                            const swapId = getSwapId(swap, swapIndex);
                            const isExpanded = expandedSwaps[swapId] || false;
                            
                            return (
                              <Card key={idx} className={`shadow-none border ${swap.isCompleted ? 'bg-muted/20' : ''}`}>
                                {/* Collapsible Swap Card Header */}
                                <div 
                                  className="p-3 cursor-pointer hover:bg-muted/30" 
                                  onClick={() => toggleSwapExpansion(swapId)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <CalendarDays className="mr-2 h-4 w-4" />
                                      {format(new Date(swap.date), "MMMM d, yyyy")}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className={`px-2 py-1 rounded-full text-xs ${
                                        swapKey === "swap-done" 
                                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      }`}>
                                        {swapKey === "swap-done" ? "Owed to You" : "You Owe"}
                                      </div>
                                      <ChevronDown 
                                        className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center mt-2">
                                    <div className="flex-1">
                                      <div className="flex items-center">
                                        <ArrowLeftRight className="mr-2 h-4 w-4" />
                                        <span className="font-medium">{swap.workerName}</span>
                                        {swap.isCompleted && (
                                          <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                                        )}
                                      </div>
                                      <div className="flex items-center mt-1">
                                        <Clock className="mr-2 h-4 w-4" />
                                        <span>{swap.hours} hour{swap.hours !== 1 ? "s" : ""}</span>
                                        
                                        {/* Status indicator badges */}
                                        <div className="flex items-center ml-auto space-x-1">
                                          {swap.images && swap.images.length > 0 && (
                                            <div className="flex items-center text-xs text-primary">
                                              <Image className="mr-1 h-3.5 w-3.5" />
                                              <span>{swap.images.length}</span>
                                            </div>
                                          )}
                                          
                                          {swap.isCompleted ? (
                                            <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 rounded-sm font-medium">
                                              Done
                                            </span>
                                          ) : (
                                            <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded-sm font-medium">
                                              Pending
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Collapsible Swap Card Content */}
                                {isExpanded && (
                                  <>
                                    <CardContent className="p-3 pt-0 border-t">
                                      {/* Display swap images if they exist */}
                                      {swap.images && swap.images.length > 0 && (
                                        <div className="mt-3 grid grid-cols-3 gap-1">
                                          {swap.images.map((image, i) => (
                                            <div 
                                              key={i} 
                                              className="cursor-pointer"
                                              onClick={() => handleImageClick(image)}
                                            >
                                              <img 
                                                src={image} 
                                                alt={`Swap image ${i+1}`} 
                                                className="rounded-md w-full h-14 object-cover border"
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      
                                      {swap.note && (
                                        <div className="mt-3 text-xs text-muted-foreground">
                                          {swap.note}
                                        </div>
                                      )}
                                      
                                      <div className="mt-3 flex items-center">
                                        <Checkbox 
                                          id={`swap-completed-${idx}`} 
                                          checked={swap.isCompleted}
                                          onCheckedChange={() => handleSwapStatusToggle(swapIndex)}
                                          className="mr-2"
                                        />
                                        <Label 
                                          htmlFor={`swap-completed-${idx}`}
                                          className={`text-sm font-medium ${swap.isCompleted ? 'line-through text-muted-foreground' : ''}`}
                                        >
                                          Paid Back / Done
                                        </Label>
                                        {swap.isCompleted && (
                                          <CheckCircle2 className="ml-auto h-4 w-4 text-green-500" />
                                        )}
                                      </div>
                                    </CardContent>
                                    <CardFooter className="p-2 pt-0 flex justify-end gap-2 border-t">
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleEditClick('swap', swapIndex)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-destructive hover:text-destructive/90"
                                        onClick={() => handleDeleteClick('swap', swapIndex)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete</span>
                                      </Button>
                                    </CardFooter>
                                  </>
                                )}
                              </Card>
                            );
                          } else {
                            // This is a TOIL note
                            const note = item as ExtendedNote;
                            return (
                              <Card key={idx} className="shadow-none border">
                                <CardContent className="p-3">
                                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    {format(new Date(note.date), "MMMM d, yyyy")}
                                  </div>
                                  
                                  {note.header && (
                                    <h4 className="text-base font-semibold mb-2">{note.header}</h4>
                                  )}
                                  
                                  {renderNoteContent(note)}
                                </CardContent>
                                <CardFooter className="p-2 pt-0 flex justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEditClick('note', findOriginalNoteIndex(note))}
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-destructive hover:text-destructive/90"
                                    onClick={() => handleDeleteClick('note', findOriginalNoteIndex(note))}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </CardFooter>
                              </Card>
                            );
                          }
                        })
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              {selectedItem?.type === 'note' ? ' note' : ' shift swap record'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit {selectedItem?.type === 'note' ? 'Note' : 'Shift Swap'}
            </DialogTitle>
            <DialogDescription>
              Make changes to your {selectedItem?.type === 'note' ? 'note' : 'shift swap record'}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem?.type === 'note' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-note-header">Header</Label>
                <Input
                  id="edit-note-header"
                  placeholder="Enter note header..."
                  value={editNoteHeader}
                  onChange={(e) => setEditNoteHeader(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Content</Label>
                <div className="space-y-3">
                  {editNoteContent.map((block, index) => (
                    <div key={index} className="relative">
                      {block.type === 'text' ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Enter your note here..."
                            value={block.content}
                            onChange={(e) => updateEditNoteTextContent(index, e.target.value)}
                            className="min-h-[100px]"
                          />
                          <div className="flex gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleEditImageUpload(e, index)}
                              className="hidden"
                              id={`edit-note-image-upload-${index}`}
                              ref={index === editNoteContent.length - 1 ? editFileInputRef : null}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => document.getElementById(`edit-note-image-upload-${index}`)?.click()}
                            >
                              <Image className="mr-2 h-4 w-4" />
                              Add Image
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleEditCameraCapture(index)}
                            >
                              <Camera className="mr-2 h-4 w-4" />
                              Camera
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <img 
                            src={block.content} 
                            alt={`Note attachment ${index}`} 
                            className="max-h-[200px] w-auto object-contain rounded-md border"
                          />
                          <Button 
                            onClick={() => removeEditContentBlock(index)} 
                            variant="destructive" 
                            size="sm" 
                            className="absolute top-2 right-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-swap-worker">Worker Name</Label>
                <Input
                  id="edit-swap-worker"
                  placeholder="Enter colleague name"
                  value={editSwapWorkerName}
                  onChange={(e) => setEditSwapWorkerName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-swap-hours">Hours</Label>
                <Input
                  id="edit-swap-hours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  placeholder="Number of hours"
                  value={editSwapHours}
                  onChange={(e) => setEditSwapHours(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Swap Type</Label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${editSwapType === "owed" ? "text-foreground font-medium" : "text-muted-foreground"}`}>You Owe</span>
                    <Switch 
                      checked={editSwapType === "payback"}
                      onCheckedChange={(checked) => setEditSwapType(checked ? "payback" : "owed")}
                    />
                    <span className={`text-sm ${editSwapType === "payback" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Owed to You</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Images</Label>
                
                {editSwapImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {editSwapImages.map((image, i) => (
                      <div key={i} className="relative rounded-md overflow-hidden border">
                        <img 
                          src={image} 
                          alt={`Swap image ${i+1}`} 
                          className="w-full h-24 object-cover cursor-pointer"
                          onClick={() => handleImageClick(image)}
                        />
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeEditSwapImage(i)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditSwapImageUpload}
                    className="hidden"
                    id="edit-swap-image-upload"
                    ref={editSwapFileInputRef}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => document.getElementById("edit-swap-image-upload")?.click()}
                  >
                    <Image className="mr-2 h-4 w-4" />
                    Add Image
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleEditSwapCameraCapture}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Camera
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit-swap-completed" 
                  checked={editIsSwapCompleted}
                  onCheckedChange={(checked) => setEditIsSwapCompleted(checked === true)}
                />
                <Label htmlFor="edit-swap-completed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Paid Back / Done
                </Label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Image Preview Modal */}
      <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent className="max-w-lg sm:max-w-3xl p-1 bg-background/80 backdrop-blur-sm">
          <div className="relative w-full">
            <DialogClose className="absolute right-2 top-2 z-10 bg-black/20 hover:bg-black/40 rounded-full p-1">
              <X className="h-4 w-4 text-white" />
            </DialogClose>
            <img 
              src={previewImage} 
              alt="Preview" 
              className="w-full max-h-[80vh] object-contain rounded" 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesTracking;
