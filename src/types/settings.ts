
export interface AppSettings {
  currency: {
    symbol: string;
    position: 'before' | 'after';
  };
  paydayEnabled: boolean;
  paydayDate: number;
  paydayType: 'weekly' | 'fortnightly' | 'set-day' | 'first-day' | 'last-day';
  paydayColor: string;
  calendarSize: 'small' | 'large';
  calendarNumberLayout: 'centre' | 'top-left' | 'top-right';
  longPressEnabled: boolean;
  showOverlappingDates: boolean;
  showIconTitles: boolean;
  notifications?: {
    enabled: boolean;
    defaultReminderTime: string;
    sound: boolean;
    vibration: boolean;
  };
  overtime: {
    enabled: boolean;
    defaultRate: number;
    onlyTrackOvertimeType?: boolean;
    specialRates: {
      weekend: number;
      holiday: number;
    };
    schedule: {
      type: 'none' | 'weekly' | 'fortnightly' | 'monthly' | 'monthly-day' | 'full-month';
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
  paydayEnabled: true,
  paydayDate: 25,
  paydayType: 'set-day',
  paydayColor: '#F97316',
  calendarSize: 'small',
  calendarNumberLayout: 'centre',
  longPressEnabled: true,
  showOverlappingDates: true,
  showIconTitles: true,
  notifications: {
    enabled: true,
    defaultReminderTime: "01:00",
    sound: true,
    vibration: true
  },
  overtime: {
    enabled: true,
    defaultRate: 1.5,
    onlyTrackOvertimeType: true,
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
