
import { addDays } from "date-fns";
import { PatternCycle, ShiftAssignment } from "@/types/calendar";

export const generatePattern = (
  pattern: PatternCycle,
  startDate: Date,
  yearsToGenerate: number
): ShiftAssignment[] => {
  if (isNaN(startDate.getTime())) {
    throw new Error('Invalid start date');
  }

  const newShifts: ShiftAssignment[] = [];
  
  // Calculate total days in one sequence including the days off after repeats
  const sequenceDays = pattern.sequences.reduce((total, seq) => total + seq.days, 0);
  const totalSequenceDays = sequenceDays * pattern.repeatTimes + pattern.daysOffAfter;
  
  // Calculate total days needed for the requested years
  const daysPerYear = 365.25;
  const totalDaysNeeded = Math.ceil(daysPerYear * yearsToGenerate);
  
  // Generate shifts for each day up to totalDaysNeeded
  for (let currentDay = 0; currentDay < totalDaysNeeded; currentDay++) {
    const dayInPattern = currentDay % totalSequenceDays;
    const currentRepetition = Math.floor(dayInPattern / sequenceDays);
    
    // Skip days during the off period after repetitions
    if (currentRepetition >= pattern.repeatTimes) {
      continue;
    }
    
    const dayInSequence = dayInPattern % sequenceDays;
    let daysAccumulated = 0;
    
    for (const sequence of pattern.sequences) {
      if (dayInSequence >= daysAccumulated && 
          dayInSequence < daysAccumulated + sequence.days) {
        if (sequence.shiftType && !sequence.isOff) {
          const shiftDate = addDays(startDate, currentDay);
          
          newShifts.push({
            date: shiftDate.toISOString(),
            shiftType: {
              name: sequence.shiftType.name,
              color: sequence.shiftType.color,
              gradient: sequence.shiftType.gradient
            }
          });
        }
        break;
      }
      daysAccumulated += sequence.days;
    }
  }
  
  return newShifts;
};
