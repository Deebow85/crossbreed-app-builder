
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
  console.log('Pattern generation started:', { pattern, startDate, years });
  
  const shifts: ShiftAssignment[] = [];
  const sequences = pattern.sequences;
  const repeatTimes = pattern.repeatTimes;
  const daysOffAfter = pattern.daysOffAfter;
  const isContinuous = pattern.isContinuous;

  let currentDate = startOfDay(new Date(startDate));
  const endDate = addDays(currentDate, years * 365);

  if (isContinuous) {
    while (currentDate < endDate) {
      // Process each sequence in the pattern
      for (const sequence of sequences) {
        if (currentDate >= endDate) break;
        
        const daysInSequence = sequence.days;
        
        if (!sequence.isOff && sequence.shiftType) {
          // Add work shifts
          for (let i = 0; i < daysInSequence; i++) {
            if (currentDate >= endDate) break;
            
            shifts.push({
              date: currentDate.toISOString(),
              shiftType: sequence.shiftType
            });
            currentDate = addDays(currentDate, 1);
          }
        } else {
          // Add off days by just advancing the date
          currentDate = addDays(currentDate, daysInSequence);
        }
      }
    }
    return shifts;
  }

  // Non-continuous pattern (repeating with breaks)
  while (currentDate < endDate) {
    for (let repeat = 0; repeat < repeatTimes; repeat++) {
      for (const sequence of sequences) {
        if (currentDate >= endDate) break;

        if (!sequence.isOff && sequence.shiftType) {
          for (let day = 0; day < sequence.days; day++) {
            if (currentDate >= endDate) break;
            
            shifts.push({
              date: currentDate.toISOString(),
              shiftType: sequence.shiftType
            });
            currentDate = addDays(currentDate, 1);
          }
        } else {
          currentDate = addDays(currentDate, sequence.days);
        }
      }
    }
    currentDate = addDays(currentDate, daysOffAfter);
  }

  console.log('Generated shifts:', shifts);
  return shifts;
};
