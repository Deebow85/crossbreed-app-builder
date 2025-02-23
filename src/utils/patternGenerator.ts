
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
  const shifts: ShiftAssignment[] = [];
  const sequences = pattern.sequences;
  const repeatTimes = pattern.repeatTimes;
  const daysOffAfter = pattern.daysOffAfter;

  let currentDate = startOfDay(new Date(startDate));
  const endDate = addDays(currentDate, years * 365);

  // When repeatTimes is 0, just follow the sequence continuously
  if (repeatTimes === 0) {
    while (currentDate < endDate) {
      for (const sequence of sequences) {
        for (let day = 0; day < sequence.days; day++) {
          if (currentDate >= endDate) break;
          
          if (!sequence.isOff && sequence.shiftType) {
            shifts.push({
              date: currentDate.toISOString(),
              shiftType: sequence.shiftType
            });
          }
          currentDate = addDays(currentDate, 1);
        }
      }
    }
    return shifts;
  }

  // Original logic for when repeatTimes > 0
  while (currentDate < endDate) {
    for (let repeat = 0; repeat < repeatTimes; repeat++) {
      for (const sequence of sequences) {
        for (let day = 0; day < sequence.days; day++) {
          if (currentDate >= endDate) break;
          
          if (!sequence.isOff && sequence.shiftType) {
            shifts.push({
              date: currentDate.toISOString(),
              shiftType: sequence.shiftType
            });
          }
          currentDate = addDays(currentDate, 1);
        }
      }
    }
    
    // Add days off after the pattern cycle
    currentDate = addDays(currentDate, daysOffAfter);
  }

  return shifts;
};
