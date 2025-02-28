
export type ShiftType = {
  name: string;
  color: string;
  gradient: string;
  isOvertime?: boolean;
  isTOIL?: boolean;
  isSwapDone?: boolean;
  isSwapOwed?: boolean;
};

export type ShiftAssignment = {
  date: string;
  shiftType: ShiftType;
  otHours?: number;
};

export type PaydaySettings = {
  date: number;
  symbol: string;
  paydayType: "weekly" | "fortnightly" | "monthly" | "set-day" | "first-day" | "last-day" | "custom";
  paydayDate: number;
};

export type ShiftPattern = {
  id: string;
  name: string;
  color: string;
  shiftType: ShiftType;
  daysOn: number;
  daysOff: number;
  startDate?: Date;
};

export type SwapType = "owed" | "payback";

export type TOILType = "taken" | "done";

export type ShiftSwap = {
  date: string;
  workerName: string;
  type: SwapType;
  hours: number;
  monetaryValue?: number;
  note?: string;
};

export type Note = {
  id: string;
  date: string;
  text: string;
  swap?: ShiftSwap;
  toilType?: TOILType;
  isToilDone?: boolean;
  isToilTaken?: boolean;
};

export type Alarm = {
  date: string;
  shiftId: string;
  time: string;
  enabled: boolean;
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
