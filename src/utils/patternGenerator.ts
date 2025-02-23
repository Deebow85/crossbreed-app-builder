import { addDays, startOfDay } from "date-fns";

export interface ShiftType {
  name: string;
  symbol: string;
  color: string;
  gradient: string;
}

export interface ShiftAssignment {
  date: string;
  shiftType: ShiftType;
}

interface ShiftPattern {
  shiftType: ShiftType | null;
  days: number;
  isOff?: boolean;
}

interface PatternCycle {
  sequences: ShiftPattern[];
  repeatTimes: number;
  daysOffAfter: number;
  patternName?: string;
  isContinuous?: boolean;
}

export const generatePattern = (
  pattern: PatternCycle,
  startDate: Date,
  years: number
): ShiftAssignment[] => {
  console.log('Starting pattern generation with:', {
    pattern,
    startDate: startDate.toISOString(),
    years
  });
  
  const shifts: ShiftAssignment[] = [];
  let currentDate = startOfDay(new Date(startDate));
  const endDate = addDays(currentDate, years * 365);

  // Simple continuous pattern generation - just keep adding shifts according to pattern
  while (currentDate < endDate) {
    for (const sequence of pattern.sequences) {
      for (let i = 0; i < sequence.days; i++) {
        if (currentDate >= endDate) break;
        
        // Only add shifts for work days
        if (!sequence.isOff && sequence.shiftType) {
          shifts.push({
            date: currentDate.toISOString(),
            shiftType: sequence.shiftType
          });
        }
        
        currentDate = addDays(currentDate, 1);
      }
      
      if (currentDate >= endDate) break;
    }
  }

  console.log(`Generated ${shifts.length} shifts`);
  return shifts;
};
