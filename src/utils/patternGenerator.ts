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
  const shifts: ShiftAssignment[] = [];
  const sequences = pattern.sequences;
  const repeatTimes = pattern.repeatTimes;
  const daysOffAfter = pattern.daysOffAfter;
  const isContinuous = pattern.isContinuous;

  let currentDate = startOfDay(new Date(startDate));
  const endDate = addDays(currentDate, years * 365);

  // For continuous pattern mode, just follow the sequence continuously
  if (isContinuous) {
    while (currentDate < endDate) {
      for (const sequence of sequences) {
        // Skip if we've passed the end date
        if (currentDate >= endDate) break;

        // Whether it's a work shift or off days, we need to advance the date by the specified days
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
          // For off days, just advance the date without adding shifts
          currentDate = addDays(currentDate, sequence.days);
        }
      }
      // No additional days off are added in continuous mode - it just keeps repeating
    }
    return shifts;
  }

  // Original logic for repeated patterns
  while (currentDate < endDate) {
    for (let repeat = 0; repeat < repeatTimes; repeat++) {
      for (const sequence of sequences) {
        // Skip if we've passed the end date
        if (currentDate >= endDate) break;

        if (!sequence.isOff && sequence.shiftType) {
          // Add shift for each non-off day in the sequence
          for (let day = 0; day < sequence.days; day++) {
            if (currentDate >= endDate) break;
            
            shifts.push({
              date: currentDate.toISOString(),
              shiftType: sequence.shiftType
            });
            currentDate = addDays(currentDate, 1);
          }
        } else {
          // For off days, just advance the date
          currentDate = addDays(currentDate, sequence.days);
        }
      }
    }
    
    // Add days off after the pattern cycle (only for non-continuous mode)
    currentDate = addDays(currentDate, daysOffAfter);
  }

  return shifts;
};
