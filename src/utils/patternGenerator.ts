
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
  const sequences = pattern.sequences;
  const isContinuous = pattern.isContinuous;

  let currentDate = startOfDay(new Date(startDate));
  const endDate = addDays(currentDate, years * 365);

  let cycleCount = 0;
  
  // Single unified approach for both continuous and non-continuous patterns
  while (currentDate < endDate) {
    // If non-continuous and we've completed all repeats, add break and continue
    if (!isContinuous && cycleCount >= pattern.repeatTimes) {
      console.log(`Completed ${pattern.repeatTimes} cycles, adding ${pattern.daysOffAfter} days break`);
      currentDate = addDays(currentDate, pattern.daysOffAfter);
      cycleCount = 0;
      continue;
    }

    // Process one complete cycle of the pattern
    for (const sequence of sequences) {
      if (currentDate >= endDate) break;
      
      console.log(`Processing sequence:`, {
        isOff: sequence.isOff,
        days: sequence.days,
        shiftType: sequence.shiftType?.name,
        currentDate: currentDate.toISOString()
      });

      // Whether work or off days, we process them the same way
      for (let i = 0; i < sequence.days; i++) {
        if (currentDate >= endDate) break;
        
        // Only add to shifts if it's a work day
        if (!sequence.isOff && sequence.shiftType) {
          shifts.push({
            date: currentDate.toISOString(),
            shiftType: sequence.shiftType
          });
        }
        
        currentDate = addDays(currentDate, 1);
      }
    }
    
    cycleCount++;
    console.log(`Completed cycle ${cycleCount}`);
  }

  console.log(`Generated ${shifts.length} shifts`);
  return shifts;
};
