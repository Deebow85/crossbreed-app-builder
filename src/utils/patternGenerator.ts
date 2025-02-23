
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
  
  // Process each sequence in order
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

const generateContinuousPattern = (
  pattern: PatternCycle,
  startDate: Date,
  years: number
): ShiftAssignment[] => {
  const shifts: ShiftAssignment[] = [];
  let currentDate = startOfDay(new Date(startDate));
  const endDate = addDays(currentDate, years * 365);

  console.log('Generating continuous pattern from', format(currentDate, 'yyyy-MM-dd'), 
              'to', format(endDate, 'yyyy-MM-dd'));

  // Calculate cycle length
  const cycleLength = pattern.sequences.reduce((total, seq) => total + seq.days, 0);
  console.log('Cycle length:', cycleLength, 'days');

  // Get work sequence
  const workSequence = pattern.sequences.find(seq => !seq.isOff && seq.shiftType);
  if (!workSequence || !workSequence.shiftType) return shifts;

  while (currentDate < endDate) {
    // Get position in current cycle
    const totalDaysFromStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const dayInCycle = totalDaysFromStart % cycleLength;
    
    // Find if current day should be a work day
    let daysAccumulated = 0;
    let isWorkDay = false;
    
    for (const sequence of pattern.sequences) {
      if (dayInCycle >= daysAccumulated && dayInCycle < daysAccumulated + sequence.days) {
        if (!sequence.isOff && sequence.shiftType) {
          isWorkDay = true;
          shifts.push({
            date: currentDate.toISOString(),
            shiftType: sequence.shiftType
          });
          console.log('Added shift for', format(currentDate, 'yyyy-MM-dd'));
        }
        break;
      }
      daysAccumulated += sequence.days;
    }

    currentDate = addDays(currentDate, 1);
  }

  return shifts;
};

export const generatePattern = (
  pattern: PatternCycle,
  startDate: Date,
  years: number
): ShiftAssignment[] => {
  if (pattern.isContinuous) {
    return generateContinuousPattern(pattern, startDate, years);
  }
  
  // For non-continuous patterns, generate repeating cycles with breaks
  const shifts: ShiftAssignment[] = [];
  let currentDate = startOfDay(new Date(startDate));
  
  for (let i = 0; i < pattern.repeatTimes; i++) {
    // Generate one cycle
    const cycleShifts = generateSingleCycle(pattern, currentDate);
    shifts.push(...cycleShifts);
    
    // Move to start of next cycle (including days off after)
    const cycleDays = pattern.sequences.reduce((total, seq) => total + seq.days, 0);
    currentDate = addDays(currentDate, cycleDays + pattern.daysOffAfter);
  }
  
  return shifts;
};
