
import { useState, useCallback, useEffect } from 'react';
import { Note } from '@/types/calendar';

const NOTES_STORAGE_KEY = 'calendar-notes';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  
  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (error) {
        console.error('Failed to parse saved notes:', error);
        setNotes([]);
      }
    }
  }, []);
  
  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);
  
  const addNote = useCallback((note: Note) => {
    setNotes(prevNotes => {
      // Check if a note already exists for this date
      const existingNoteIndex = prevNotes.findIndex(n => n.date === note.date);
      
      if (existingNoteIndex >= 0) {
        // Update existing note
        const updatedNotes = [...prevNotes];
        updatedNotes[existingNoteIndex] = note;
        return updatedNotes;
      } else {
        // Add new note
        return [...prevNotes, note];
      }
    });
  }, []);
  
  const deleteNote = useCallback((date: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.date !== date));
  }, []);
  
  const getNoteForDate = useCallback((date: Date) => {
    const dateString = date.toISOString();
    return notes.find(note => {
      // Compare only the date part (not time)
      const noteDate = new Date(note.date);
      const targetDate = new Date(dateString);
      
      return noteDate.getFullYear() === targetDate.getFullYear() &&
             noteDate.getMonth() === targetDate.getMonth() &&
             noteDate.getDate() === targetDate.getDate();
    });
  }, [notes]);
  
  return {
    notes,
    addNote,
    deleteNote,
    getNoteForDate
  };
}
