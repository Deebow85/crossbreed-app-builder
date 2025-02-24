
import { differenceInDays, getDay, addDays, startOfMonth, addWeeks, lastDayOfMonth, addMonths } from "date-fns";
import { PaydaySettings } from "@/types/calendar";

export const getNextPayday = (settings: any): Date => {
  if (!settings || !settings.paydayType) {
    // Return current date if settings are invalid
    return new Date();
  }

  const today = new Date();
  let nextPayday: Date;

  try {
    switch (settings.paydayType) {
      case 'weekly':
        nextPayday = new Date(today);
        const targetDay = settings.paydayDate || 1;
        const currentDay = getDay(today);
        const daysToAdd = (targetDay + (currentDay === 0 ? 7 : -currentDay)) % 7;
        nextPayday = addDays(nextPayday, daysToAdd);
        if (daysToAdd <= 0) {
          nextPayday = addDays(nextPayday, 7);
        }
        break;

      case 'fortnightly':
        nextPayday = new Date(today);
        const targetDay2 = settings.paydayDate || 1;
        const currentDay2 = getDay(today);
        const daysToAdd2 = (targetDay2 + (currentDay2 === 0 ? 7 : -currentDay2)) % 7;
        nextPayday = addDays(nextPayday, daysToAdd2);
        if (daysToAdd2 <= 0) {
          nextPayday = addDays(nextPayday, 7);
        }
        if (Math.floor(differenceInDays(nextPayday, startOfMonth(today)) / 14) % 2 === 0) {
          nextPayday = addWeeks(nextPayday, 1);
        }
        break;

      case 'monthly':
      case 'set-day':
        nextPayday = new Date(today.getFullYear(), today.getMonth(), settings.paydayDate || 15);
        if (today.getDate() > (settings.paydayDate || 15)) {
          nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, settings.paydayDate || 15);
        }
        break;

      case 'first-day':
        nextPayday = new Date(today.getFullYear(), today.getMonth(), 1);
        if (today.getDate() > 1) {
          nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        }
        break;

      case 'last-day':
        nextPayday = lastDayOfMonth(today);
        if (today.getDate() === lastDayOfMonth(today).getDate()) {
          nextPayday = lastDayOfMonth(addMonths(today, 1));
        }
        break;

      case 'custom':
      default:
        nextPayday = new Date(today.getFullYear(), today.getMonth(), settings.paydayDate || 15);
        if (today.getDate() > (settings.paydayDate || 15)) {
          nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, settings.paydayDate || 15);
        }
        break;
    }
    
    return nextPayday;
  } catch (error) {
    console.error('Error calculating next payday:', error);
    return new Date(); // Return current date as fallback
  }
};

export const isPayday = (date: Date, settings: any): boolean => {
  if (!settings) return false;
  
  try {
    switch (settings.paydayType) {
      case 'weekly':
        return getDay(date) === (settings.paydayDate || 1);

      case 'fortnightly': {
        if (getDay(date) !== (settings.paydayDate || 1)) return false;
        const startOfMonthDate = startOfMonth(date);
        const weeksSinceStart = Math.floor(differenceInDays(date, startOfMonthDate) / 7);
        return weeksSinceStart % 2 === 0;
      }

      case 'monthly':
      case 'set-day':
      case 'custom':
        return date.getDate() === (settings.paydayDate || 15);

      case 'first-day':
        return date.getDate() === 1;

      case 'last-day':
        return date.getDate() === lastDayOfMonth(date).getDate();

      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking if date is payday:', error);
    return false;
  }
};
