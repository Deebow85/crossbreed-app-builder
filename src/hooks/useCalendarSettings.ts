
import { useState, useEffect } from 'react';
import { ShiftAssignment } from '@/types/calendar';

export const useCalendarSettings = () => {
  const [calendarSize, setCalendarSize] = useState<'default' | 'large' | 'small'>('default');
  const [shifts, setShifts] = useState<ShiftAssignment[]>(() => {
    const savedShifts = localStorage.getItem('calendarShifts');
    return savedShifts ? JSON.parse(savedShifts) : [];
  });

  useEffect(() => {
    localStorage.setItem('calendarShifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setCalendarSize(settings.calendarSize || 'small');
      }
    };

    loadSettings();
    window.addEventListener('storage', loadSettings);
    return () => window.removeEventListener('storage', loadSettings);
  }, []);

  return {
    calendarSize,
    shifts,
    setShifts
  };
};
