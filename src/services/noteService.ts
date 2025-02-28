
import { Note } from "@/types/calendar";

const NOTES_STORAGE_KEY = "calendarNotes";

// Get all notes from localStorage
export const getAllNotes = (): Note[] => {
  try {
    const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
    return savedNotes ? JSON.parse(savedNotes) : [];
  } catch (error) {
    console.error("Error retrieving notes:", error);
    return [];
  }
};

// Save a note
export const saveNote = (note: Note): void => {
  try {
    const notes = getAllNotes();
    const existingIndex = notes.findIndex(n => n.date === note.date);
    
    if (existingIndex >= 0) {
      // Update existing note
      notes[existingIndex] = note;
    } else {
      // Add new note
      notes.push(note);
    }
    
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Error saving note:", error);
  }
};

// Delete a note by date
export const deleteNote = (dateStr: string): void => {
  try {
    const notes = getAllNotes();
    const updatedNotes = notes.filter(note => note.date !== dateStr);
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
  } catch (error) {
    console.error("Error deleting note:", error);
  }
};

// Get a specific note by date
export const getNoteByDate = (dateStr: string): Note | undefined => {
  return getAllNotes().find(note => note.date === dateStr);
};
