
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

  console.log('Start date:', format(currentDate, 'yyyy-MM-dd'));
  console.log('End date:', format(endDate, 'yyyy-MM-dd'));

  // Find the work and off sequences
  const workSequence = pattern.sequences.find(seq => !seq.isOff);
  const offSequence = pattern.sequences.find(seq => seq.isOff);
  
  if (!workSequence || !workSequence.shiftType) return shifts;

  const cycleLength = workSequence.days + (offSequence?.days || 0);
  console.log('Cycle length:', cycleLength, 'days');

  let dayCount = 0;
  while (currentDate < endDate) {
    // Determine if this is a work day
    const dayInCycle = dayCount % cycleLength;
    const isWorkDay = dayInCycle < workSequence.days;

    console.log('Current date:', format(currentDate, 'yyyy-MM-dd'), 
                'Day in cycle:', dayInCycle, 
                'Is work day:', isWorkDay);

    if (isWorkDay) {
      shifts.push({
        date: currentDate.toISOString(),
        shiftType: workSequence.shiftType
      });
    }

    currentDate = addDays(currentDate, 1);
    dayCount++;
  }

  console.log('Generated shifts:', shifts.map(s => format(new Date(s.date), 'yyyy-MM-dd')));
  return shifts;
};
