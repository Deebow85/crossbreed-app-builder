
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
}

export const generatePattern = (
  pattern: PatternCycle,
  startDate: Date,
  years: number
): ShiftAssignment[] => {
  console.log('Generating pattern with:', {
    pattern,
    startDate,
    years
  });

  const shifts: ShiftAssignment[] = [];
  const sequences = pattern.sequences;
  const repeatTimes = pattern.repeatTimes;
  const daysOffAfter = pattern.daysOffAfter;

  let currentDate = startOfDay(new Date(startDate));
  const endDate = addDays(currentDate, years * 365);

  console.log('Pattern generation parameters:', {
    sequences,
    repeatTimes,
    daysOffAfter,
    startDate: currentDate,
    endDate
  });

  // When repeatTimes is 0, just follow the sequence continuously without any days off after
  if (repeatTimes === 0) {
    while (currentDate < endDate) {
      for (const sequence of sequences) {
        console.log('Processing sequence:', sequence);
        // Skip if we've passed the end date
        if (currentDate >= endDate) break;

        if (!sequence.isOff && sequence.shiftType) {
          // Add shift for each non-off day in the sequence
          for (let day = 0; day < sequence.days; day++) {
            if (currentDate >= endDate) break;
            
            console.log('Adding shift:', {
              date: currentDate,
              shiftType: sequence.shiftType
            });

            shifts.push({
              date: currentDate.toISOString(),
              shiftType: sequence.shiftType
            });
            currentDate = addDays(currentDate, 1);
          }
        } else {
          // For off days, just advance the date
          console.log('Advancing date for off days:', sequence.days);
          currentDate = addDays(currentDate, sequence.days);
        }
      }
    }
    console.log('Generated shifts for repeat 0:', shifts);
    return shifts;
  }

  // Original logic for when repeatTimes > 0
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
    
    // Add days off after the pattern cycle (only for repeatTimes > 0)
    currentDate = addDays(currentDate, daysOffAfter);
  }

  console.log('Final generated shifts:', shifts);
  return shifts;
};
