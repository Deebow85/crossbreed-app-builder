
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
  let currentDate = startOfDay(new Date(startDate));
  const endDate = addDays(currentDate, years * 365);

  for (let cycle = 0; cycle < pattern.repeatTimes && currentDate < endDate; cycle++) {
    for (const sequence of pattern.sequences) {
      for (let i = 0; i < sequence.days && currentDate < endDate; i++) {
        if (!sequence.isOff && sequence.shiftType) {
          shifts.push({
            date: currentDate.toISOString(),
            shiftType: sequence.shiftType
          });
        }
        currentDate = addDays(currentDate, 1);
      }
    }
    if (cycle < pattern.repeatTimes - 1) {
      currentDate = addDays(currentDate, pattern.daysOffAfter);
    }
  }

  return shifts;
};
