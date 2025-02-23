
import { addDays, startOfDay, format } from "date-fns";

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
  let currentDate = startOfDay(new Date(startDate));
  const endDate = addDays(currentDate, years * 365);
  const sequences = pattern.sequences;
  const cycleLength = sequences.reduce((total, seq) => total + seq.days, 0);

  while (currentDate < endDate) {
    for (const sequence of sequences) {
      for (let i = 0; i < sequence.days; i++) {
        if (!sequence.isOff && sequence.shiftType) {
          shifts.push({
            date: currentDate.toISOString(),
            shiftType: sequence.shiftType
          });
        }
        currentDate = addDays(currentDate, 1);
        if (currentDate >= endDate) break;
      }
      if (currentDate >= endDate) break;
    }
    
    if (!pattern.isContinuous) {
      currentDate = addDays(currentDate, pattern.daysOffAfter);
    }
  }

  return shifts;
};
