
export type ShiftType = {
  name: string;
  color: string;
  gradient: string;
};

export type ShiftAssignment = {
  date: string;
  shiftType: ShiftType;
  otHours?: number;
};

export type PatternCycle = {
  sequences: {
    shiftType: ShiftType | null;
    days: number;
    isOff?: boolean;
  }[];
  repeatTimes: number;
  daysOffAfter: number;
};
