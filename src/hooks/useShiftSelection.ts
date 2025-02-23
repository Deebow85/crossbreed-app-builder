
import { useState } from 'react';
import { eachDayOfInterval } from 'date-fns';
import { ShiftType, ShiftAssignment } from '@/types/calendar';

export const useShiftSelection = (shifts: ShiftAssignment[], setShifts: (shifts: ShiftAssignment[]) => void) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType | null>(null);

  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString();
    const shift = shifts.find(s => s.date === dateStr);
    
    if (shift && selectedShiftType) {
      setShifts(shifts.filter(s => s.date !== dateStr));
    } else if (selectedShiftType) {
      setShifts([...shifts, { date: dateStr, shiftType: selectedShiftType }]);
    }
  };

  const handleDayMouseDown = (date: Date) => {
    setIsSelecting(true);
    setSelectionStart(date.toISOString());
  };

  const handleDayMouseUp = (date: Date) => {
    if (selectionStart && isSelecting && selectedShiftType) {
      const startDate = new Date(selectionStart);
      const endDate = date;
      
      const [finalStart, finalEnd] = startDate < endDate 
        ? [startDate, endDate] 
        : [endDate, startDate];

      const dateRange = eachDayOfInterval({ start: finalStart, end: finalEnd });
      
      const newShifts = dateRange.map(date => ({
        date: date.toISOString(),
        shiftType: selectedShiftType
      }));

      const filteredShifts = shifts.filter(shift => 
        !newShifts.some(newShift => newShift.date === shift.date)
      );

      setShifts([...filteredShifts, ...newShifts]);
    }
    
    setIsSelecting(false);
    setSelectionStart(null);
  };

  return {
    isSelecting,
    selectionStart,
    selectedShiftType,
    setSelectedShiftType,
    handleDayClick,
    handleDayMouseDown,
    handleDayMouseUp
  };
};
