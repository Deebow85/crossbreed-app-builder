
export interface AppSettings {
  currency: {
    symbol: string;
    position: 'before' | 'after';
  };
  paydayDate: number;
  paydayType: 'weekly' | 'fortnightly' | 'set-day' | 'first-day' | 'last-day';
  calendarSize: 'small' | 'large';
  calendarNumberLayout: 'centre' | 'top-left' | 'top-right';
  longPressEnabled: boolean;
  overtime: {
    enabled: boolean;
    defaultRate: number;
    specialRates: {
      weekend: number;
      holiday: number;
    };
    schedule: {
      type: 'none' | 'weekly' | 'fortnightly' | 'monthly';
      hours: number;
      dayOfWeek?: number;
      dayOfMonth?: number;
      weekNumber?: number;
    };
  };
}

export const defaultSettings: AppSettings = {
  currency: {
    symbol: '£',
    position: 'before'
  },
  paydayDate: 25,
  paydayType: 'set-day',
  calendarSize: 'small',
  calendarNumberLayout: 'centre',
  longPressEnabled: true,
  overtime: {
    enabled: true,
    defaultRate: 1.5,
    specialRates: {
      weekend: 2,
      holiday: 2.5
    },
    schedule: {
      type: 'none',
      hours: 0
    }
  }
};
