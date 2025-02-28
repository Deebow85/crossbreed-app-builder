
import { Note } from "@/types/calendar";

// Get all notes from localStorage
export const getAllNotes = (): Note[] => {
  try {
    const notes = localStorage.getItem("calendar-notes");
    return notes ? JSON.parse(notes) : [];
  } catch (error) {
    console.error("Error getting notes:", error);
    return [];
  }
};

// Get note by date
export const getNoteByDate = (dateString: string): Note | undefined => {
  const notes = getAllNotes();
  return notes.find(note => note.date === dateString);
};

// Save a note
export const saveNote = (note: Note): void => {
  try {
    const notes = getAllNotes();
    const existingNoteIndex = notes.findIndex(n => n.date === note.date);
    
    if (existingNoteIndex >= 0) {
      // Update existing note
      notes[existingNoteIndex] = note;
    } else {
      // Add new note
      notes.push(note);
    }
    
    localStorage.setItem("calendar-notes", JSON.stringify(notes));
  } catch (error) {
    console.error("Error saving note:", error);
  }
};

// Delete a note
export const deleteNote = (dateString: string): void => {
  try {
    const notes = getAllNotes();
    const filteredNotes = notes.filter(note => note.date !== dateString);
    localStorage.setItem("calendar-notes", JSON.stringify(filteredNotes));
  } catch (error) {
    console.error("Error deleting note:", error);
  }
};
