
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

const generateSingleCycle = (
  pattern: PatternCycle,
  startDate: Date
): ShiftAssignment[] => {
  const shifts: ShiftAssignment[] = [];
  let currentDate = startOfDay(new Date(startDate));
  
  for (const sequence of pattern.sequences) {
    for (let i = 0; i < sequence.days; i++) {
      if (!sequence.isOff && sequence.shiftType) {
        shifts.push({
          date: currentDate.toISOString(),
          shiftType: sequence.shiftType
        });
      }
      currentDate = addDays(currentDate, 1);
    }
  }
  
  return shifts;
};

export const generateContinuousPattern = (
  sequences: ShiftPattern[],
  startDate: Date,
  years: number
): ShiftAssignment[] => {
  const shifts: ShiftAssignment[] = [];
  let currentDate = startOfDay(new Date(startDate));
  const endDate = addDays(currentDate, years * 365);

  console.log('Generating continuous pattern from', format(currentDate, 'yyyy-MM-dd'), 
              'to', format(endDate, 'yyyy-MM-dd'));

  const cycleLength = sequences.reduce((total, seq) => total + seq.days, 0);
  console.log('Cycle length:', cycleLength, 'days');

  while (currentDate < endDate) {
    const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const dayInCycle = daysSinceStart % cycleLength;
    let daysAccumulated = 0;
    
    for (const sequence of sequences) {
      if (dayInCycle >= daysAccumulated && dayInCycle < daysAccumulated + sequence.days) {
        if (!sequence.isOff && sequence.shiftType) {
          shifts.push({
            date: currentDate.toISOString(),
            shiftType: sequence.shiftType
          });
        }
        break;
      }
      daysAccumulated += sequence.days;
    }
    
    currentDate = addDays(currentDate, 1);
  }

  return shifts;
};

export const generateRepeatingPattern = (
  pattern: PatternCycle,
  startDate: Date
): ShiftAssignment[] => {
  const shifts: ShiftAssignment[] = [];
  let currentDate = startOfDay(new Date(startDate));
  
  for (let i = 0; i < pattern.repeatTimes; i++) {
    const cycleShifts = generateSingleCycle(pattern, currentDate);
    shifts.push(...cycleShifts);
    
    const cycleDays = pattern.sequences.reduce((total, seq) => total + seq.days, 0);
    currentDate = addDays(currentDate, cycleDays + pattern.daysOffAfter);
  }
  
  return shifts;
};

export const generatePattern = (
  pattern: PatternCycle,
  startDate: Date,
  years: number
): ShiftAssignment[] => {
  if (pattern.isContinuous) {
    return generateContinuousPattern(pattern.sequences, startDate, years);
  }
  return generateRepeatingPattern(pattern, startDate);
};
