
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

  // Get work days sequence
  const workSequence = pattern.sequences.find(seq => !seq.isOff && seq.shiftType);
  if (!workSequence) return shifts;

  while (currentDate < endDate) {
    // For work days
    for (let i = 0; i < workSequence.days; i++) {
      if (currentDate >= endDate) break;
      
      shifts.push({
        date: currentDate.toISOString(),
        shiftType: workSequence.shiftType!
      });
      currentDate = addDays(currentDate, 1);
    }

    // For off days - just advance the date
    const offDays = pattern.sequences.find(seq => seq.isOff)?.days || 0;
    currentDate = addDays(currentDate, offDays);
  }

  return shifts;
};
