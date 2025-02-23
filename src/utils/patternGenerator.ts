
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

  // Calculate total days in one cycle
  const totalDaysInCycle = pattern.sequences.reduce((acc, seq) => acc + seq.days, 0);
  console.log('Total days in one cycle:', totalDaysInCycle);

  let dayInCycle = 0;
  while (currentDate < endDate) {
    // Find which sequence we're in
    let daysAccumulated = 0;
    for (const sequence of pattern.sequences) {
      if (dayInCycle >= daysAccumulated && dayInCycle < daysAccumulated + sequence.days) {
        // We're in this sequence
        if (!sequence.isOff && sequence.shiftType) {
          shifts.push({
            date: currentDate.toISOString(),
            shiftType: sequence.shiftType
          });
          console.log(`Added shift for ${currentDate.toISOString()}`);
        }
        break;
      }
      daysAccumulated += sequence.days;
    }

    // Move to next day
    currentDate = addDays(currentDate, 1);
    dayInCycle = (dayInCycle + 1) % totalDaysInCycle;
  }

  console.log(`Generated ${shifts.length} shifts`);
  return shifts;
};
