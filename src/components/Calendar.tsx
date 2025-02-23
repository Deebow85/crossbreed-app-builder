import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Banknote, Clock, CalendarDays, StickyNote, Search, Bell, Plus, Check, Settings } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, differenceInDays, startOfWeek, endOfWeek, addDays, setHours, setMinutes, getDay, addWeeks, lastDayOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { LocalNotifications } from '@capacitor/local-notifications';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/lib/theme";

type ShiftType = {
  name: string;
  color: string;
  gradient: string;
};

type ShiftAssignment = {
  date: string;
  shiftType: ShiftType;
  otHours?: number;
};

type PaydaySettings = {
  date: number;
  symbol: string;
  paydayType: "weekly" | "fortnightly" | "monthly" | "set-day" | "first-day" | "last-day" | "custom";
  paydayDate: number;
};

type ShiftPattern = {
  id: string;
  name: string;
  color: string;
  shiftType: ShiftType;
  daysOn: number;
  daysOff: number;
  startDate?: Date;
};

type Note = {
  date: string;
  text: string;
  swap?: ShiftSwap;
};

type SwapType = "owed" | "payback";

type ShiftSwap = {
  date: string;
  workerName: string;
  type: SwapType;
  hours: number;
  monetaryValue?: number;
  note?: string;
};

type Alarm = {
  date: string;
  shiftId: string;
  time: string;
  enabled: boolean;
};

type PatternCycle = {
  sequences: {
    shiftType: ShiftType | null;
    days: number;
    isOff?: boolean;
  }[];
  repeatTimes: number;
  daysOffAfter: number;
};

const shiftTypes: ShiftType[] = [];

const Calendar = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType | null>(null);
  const [shifts, setShifts] = useState<ShiftAssignment[]>(() => {
    const savedShifts = localStorage.getItem('calendarShifts');
    return savedShifts ? JSON.parse(savedShifts) : [];
  });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [paydaySettings, setPaydaySettings] = useState<PaydaySettings>({
    date: 25,
    symbol: "£",
    paydayType: "monthly",
    paydayDate: 15
  });
  const [pattern, setPattern] = useState<ShiftPattern>({
    id: 'default',
    name: 'Default',
    color: '#CCCCCC',
    shiftType: shiftTypes[0],
    daysOn: 3,
    daysOff: 3
  });
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [patterns, setPatterns] = useState<ShiftPattern[]>(() => {
    const savedPatterns = localStorage.getItem('shiftPatterns');
    return savedPatterns ? JSON.parse(savedPatterns) : [];
  });
  const [showPatternDialog, setShowPatternDialog] = useState(false);
  const [newPattern, setNewPattern] = useState<Partial<ShiftPattern>>({});
  const [highlightedPattern, setHighlightedPattern] = useState<string | null>(null);
  const [calendarSize, setCalendarSize] = useState<'default' | 'large' | 'small'>('default');

  useEffect(() => {
    localStorage.setItem('calendarShifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setCalendarSize(settings.calendarSize || 'small');
      }
    };

    loadSettings();
    window.addEventListener('storage', loadSettings);
    return () => window.removeEventListener('storage', loadSettings);
  }, []);

  useEffect(() => {
    const loadShiftTypes = async () => {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.shiftTypes && settings.shiftTypes.length > 0) {
          setSelectedShiftType(settings.shiftTypes[0]);
        }
      }
    };
    loadShiftTypes();
  }, []);

  useEffect(() => {
    const handlePatternGeneration = () => {
      const state = JSON.parse(sessionStorage.getItem('patternData') || 'null');
      console.log('Pattern state:', state);

      if (state?.pattern && state?.startDate) {
        const pattern: PatternCycle = state.pattern;
        const startDate = new Date(state.startDate + 'T00:00:00');
        const yearsToGenerate = Math.min(Math.max(state.years || 1, 0), 10); // Default 1 year, max 10 years
        
        if (isNaN(startDate.getTime())) {
          console.error('Invalid start date:', state.startDate);
          return;
        }
        
        const newShifts: ShiftAssignment[] = [];
        
        // Basic pattern: 2 days + 2 nights + 4 off = 8 days
        const daysInOneSequence = pattern.sequences.reduce((total, seq) => total + seq.days, 0);
        // Repeated 7 times = 56 days of pattern
        const patternRepeatDays = daysInOneSequence * pattern.repeatTimes;
        // Adjust daysOffAfter to 14 (which plus the pattern's 4 off days = 18 total)
        const adjustedDaysOff = 14;
        // Full cycle = 56 days pattern + 14 days additional off = 70 days
        const totalDaysInCycle = patternRepeatDays + adjustedDaysOff;
        
        // Calculate cycles needed for the requested number of years
        const daysPerYear = 365.25; // Account for leap years
        const totalDaysNeeded = daysPerYear * yearsToGenerate;
        const cyclesNeeded = Math.ceil(totalDaysNeeded / totalDaysInCycle);
        
        console.log('Pattern metrics:', {
          daysInOneSequence,
          patternRepeatDays,
          daysOffAfter: adjustedDaysOff,
          totalDaysInCycle,
          yearsToGenerate,
          cyclesNeeded
        });
        
        const totalDaysToGenerate = totalDaysInCycle * cyclesNeeded;
        
        let currentDay = 0;
        
        while (currentDay < totalDaysToGenerate) {
          const dayInCurrentCycle = currentDay % totalDaysInCycle;
          
          if (dayInCurrentCycle >= patternRepeatDays) {
            currentDay++;
            continue;
          }
          
          const dayInPattern = dayInCurrentCycle % daysInOneSequence;
          let daysAccumulated = 0;
          
          for (const sequence of pattern.sequences) {
            if (dayInPattern >= daysAccumulated && 
                dayInPattern < daysAccumulated + sequence.days) {
              if (sequence.shiftType && !sequence.isOff) {
                const shiftDate = addDays(startDate, currentDay);
                console.log('Adding shift:', {
                  day: currentDay,
                  dayInCycle: dayInCurrentCycle,
                  dayInPattern,
                  date: shiftDate.toISOString(),
                  type: sequence.shiftType.name
                });
                
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
          
          currentDay++;
        }
        
        console.log('Pattern summary:', {
          totalShifts: newShifts.length,
          cyclesGenerated: cyclesNeeded,
          totalDays: totalDaysToGenerate,
          yearsGenerated: yearsToGenerate,
          firstShift: newShifts[0]?.date,
          lastShift: newShifts[newShifts.length - 1]?.date
        });
        
        setShifts(prevShifts => {
          const patternEndDate = addDays(startDate, totalDaysToGenerate);
          const filteredPrevShifts = prevShifts.filter(shift => {
            const shiftDate = new Date(shift.date);
            const isOutsideRange = shiftDate < startDate || shiftDate >= patternEndDate;
            return isOutsideRange;
          });
          return [...filteredPrevShifts, ...newShifts];
        });
        
        setCurrentDate(startDate);
        sessionStorage.removeItem('patternData');
      }
    };

    handlePatternGeneration();
  }, []); // Run once when component mounts

  useEffect(() => {
    console.log('Current shifts:', shifts);
  }, [shifts]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getDaysUntilPayday = () => {
    const today = new Date();
    const nextPayday = getNextPayday();
    return differenceInDays(nextPayday, today);
  };

  const getNextPayday = () => {
    const savedSettings = localStorage.getItem('appSettings');
    if (!savedSettings) return new Date();

    const settings = JSON.parse(savedSettings);
    const today = new Date();
    let nextPayday: Date;

    switch (settings.paydayType) {
      case 'weekly':
        nextPayday = new Date(today);
        const targetDay = settings.paydayDate; // 1-7 for Monday-Sunday
        const currentDay = getDay(today);
        const daysToAdd = (targetDay + (currentDay === 0 ? 7 : -currentDay)) % 7;
        nextPayday = addDays(nextPayday, daysToAdd);
        if (daysToAdd <= 0) {
          nextPayday = addDays(nextPayday, 7);
        }
        break;

      case 'fortnightly':
        nextPayday = new Date(today);
        const targetDay2 = settings.paydayDate;
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
        nextPayday = new Date(today.getFullYear(), today.getMonth(), settings.paydayDate);
        if (today.getDate() > settings.paydayDate) {
          nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, settings.paydayDate);
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
        nextPayday = new Date(today.getFullYear(), today.getMonth(), settings.paydayDate);
        if (today.getDate() > settings.paydayDate) {
          nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, settings.paydayDate);
        }
        break;
    }
    
    return nextPayday;
  };

  const isPayday = (date: Date): boolean => {
    const savedSettings = localStorage.getItem('appSettings');
    if (!savedSettings) return false;

    const settings = JSON.parse(savedSettings);
    
    switch (settings.paydayType) {
      case 'weekly':
        return getDay(date) === settings.paydayDate;

      case 'fortnightly': {
        if (getDay(date) !== settings.paydayDate) return false;
        const startOfMonthDate = startOfMonth(date);
        const weeksSinceStart = Math.floor(differenceInDays(date, startOfMonthDate) / 7);
        return weeksSinceStart % 2 === 0;
      }

      case 'monthly':
      case 'set-day':
      case 'custom':
        return date.getDate() === settings.paydayDate;

      case 'first-day':
        return date.getDate() === 1;

      case 'last-day':
        return date.getDate() === lastDayOfMonth(date).getDate();

      default:
        return false;
    }
  };

  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString();
    const shift = getShiftForDate(date);
    
    if (window.event && (window.event as MouseEvent).button === 2) {
      addOrEditNote(date);
      return;
    }

    if (window.event && (window.event as MouseEvent).button === 1) {
      if (shift) {
        const hasAlarm = alarms.some(a => a.date === dateStr);
        if (hasAlarm) {
          if (window.confirm('Remove alarm for this shift?')) {
            removeAlarm(date);
          }
        } else {
          setAlarmForShift(date, shift);
        }
      }
      return;
    }

    if (!isSelecting && selectedShiftType) {
      const existingShift = shifts.find(s => s.date === dateStr);
      if (existingShift) {
        setShifts(shifts.filter(s => s.date !== dateStr));
      } else {
        setShifts([...shifts, { date: dateStr, shiftType: selectedShiftType }]);
      }
    }
  };

  const handleDayMouseDown = (date: Date) => {
    setIsSelecting(true);
    setSelectionStart(date.toISOString());
  };

  const handleDayMouseUp = (date: Date) => {
    if (selectionStart && isSelecting && selectedShiftType) {
      const startDate = new Date(selectionStart);
      const endDate = date;
      
      const [finalStart, finalEnd] = startDate < endDate 
        ? [startDate, endDate] 
        : [endDate, startDate];

      const dateRange = eachDayOfInterval({ start: finalStart, end: finalEnd });
      
      const newShifts = dateRange.map(date => ({
        date: date.toISOString(),
        shiftType: selectedShiftType
      }));

      const filteredShifts = shifts.filter(shift => 
        !newShifts.some(newShift => newShift.date === shift.date)
      );

      setShifts([...filteredShifts, ...newShifts]);
    }
    
    setIsSelecting(false);
    setSelectionStart(null);
  };

  const getShiftForDate = (date: Date) => {
    return shifts.find(shift => shift.date === date.toISOString());
  };

  const applyPattern = (pattern: ShiftPattern) => {
    const totalDays = pattern.daysOn + pattern.daysOff;
    const cycleLength = 90;
    const startDate = pattern.startDate || new Date();
    const dateRange = eachDayOfInterval({
      start: startDate,
      end: addDays(startDate, cycleLength)
    });

    const newShifts = dateRange.map((date, index) => {
      const dayInCycle = index % totalDays;
      if (dayInCycle < pattern.daysOn) {
        return {
          date: date.toISOString(),
          shiftType: pattern.shiftType
        };
      }
      return null;
    }).filter((shift): shift is ShiftAssignment => shift !== null);

    const existingShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate < startDate || shiftDate > addDays(startDate, cycleLength);
    });

    setShifts([...existingShifts, ...newShifts]);
  };

  const handlePatternInput = () => {
    const daysOn = window.prompt("Enter number of days ON:", pattern.daysOn.toString());
    if (!daysOn) return;
    
    const daysOnNum = parseInt(daysOn);
    if (isNaN(daysOnNum) || daysOnNum < 1) {
      alert("Please enter a valid number of days (minimum 1)");
      return;
    }

    const daysOff = window.prompt("Enter number of days OFF:", pattern.daysOff.toString());
    if (!daysOff) return;
    
    const daysOffNum = parseInt(daysOff);
    if (isNaN(daysOffNum) || daysOffNum < 1) {
      alert("Please enter a valid number of days (minimum 1)");
      return;
    }

    setPattern({
      id: 'default',
      name: 'Default',
      color: '#CCCCCC',
      shiftType: selectedShiftType,
      daysOn: daysOnNum,
      daysOff: daysOffNum
    });

    const shouldApply = window.confirm(`Apply pattern: ${daysOnNum} days on, ${daysOffNum} days off with ${selectedShiftType.name} shifts?`);
    if (shouldApply) {
      applyPattern(pattern);
    }
  };

  const addOrEditNote = (date: Date) => {
    const dateStr = date.toISOString();
    const existingNote = notes.find(note => note.date === dateStr);
    
    const isSwap = window.confirm("Is this a shift swap note?");
    
    if (isSwap) {
      const workerName = window.prompt("Enter worker's name:");
      if (!workerName) return;

      const type = window.confirm("Is this a shift you owe? (Cancel for payback)") ? "owed" : "payback";
      
      const hoursStr = window.prompt("Enter hours:");
      if (!hoursStr) return;
      const hours = parseFloat(hoursStr);
      if (isNaN(hours) || hours <= 0) {
        alert("Please enter a valid number of hours");
        return;
      }

      const monetaryValueStr = window.prompt("Enter monetary value (optional):");
      const monetaryValue = monetaryValueStr ? parseFloat(monetaryValueStr) : undefined;
      if (monetaryValueStr && (isNaN(monetaryValue) || monetaryValue < 0)) {
        alert("Please enter a valid monetary value");
        return;
      }

      const noteText = window.prompt("Additional notes (optional):");
      
      const swap: ShiftSwap = {
        date: dateStr,
        workerName,
        type,
        hours,
        monetaryValue,
        note: noteText || undefined
      };

      const formattedNote = `${type === "owed" ? "Owe" : "Owed by"} ${workerName}: ${hours}h` + 
        (monetaryValue ? ` (${paydaySettings.symbol}${monetaryValue})` : "") +
        (noteText ? `\n${noteText}` : "");

      setNotes(prevNotes => {
        const filtered = prevNotes.filter(note => note.date !== dateStr);
        return [...filtered, { date: dateStr, text: formattedNote, swap }];
      });
    } else {
      const noteText = window.prompt(
        "Enter note for " + format(date, 'MMM d, yyyy'),
        existingNote?.text || ""
      );

      if (noteText === null) return;

      if (noteText.trim() === "") {
        setNotes(notes.filter(note => note.date !== dateStr));
      } else {
        setNotes(prevNotes => {
          const filtered = prevNotes.filter(note => note.date !== dateStr);
          return [...filtered, { date: dateStr, text: noteText.trim() }];
        });
      }
    }
  };

  const getSwapSummary = () => {
    const swaps = notes
      .filter(note => note.swap)
      .map(note => note.swap as ShiftSwap);

    const summary = new Map<string, { owed: number; payback: number; monetary: number }>();

    swaps.forEach(swap => {
      const current = summary.get(swap.workerName) || { owed: 0, payback: 0, monetary: 0 };
      if (swap.type === "owed") {
        current.owed += swap.hours;
      } else {
        current.payback += swap.hours;
      }
      if (swap.monetaryValue) {
        current.monetary += (swap.type === "owed" ? -1 : 1) * swap.monetaryValue;
      }
      summary.set(swap.workerName, current);
    });

    return Array.from(summary.entries())
      .filter(([_, data]) => data.owed !== data.payback || data.monetary !== 0);
  };

  const getNote = (date: Date): Note | undefined => {
    return notes.find(note => note.date === date.toISOString());
  };

  const searchNotes = () => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return notes
      .filter(note => {
        const noteText = note.text.toLowerCase();
        const workerName = note.swap?.workerName.toLowerCase();
        return noteText.includes(term) || (workerName && workerName.includes(term));
      })
      .map(note => ({
        ...note,
        date: format(new Date(note.date), 'MMM d, yyyy')
      }));
  };

  const handleAddPattern = () => {
    if (!newPattern.name || !newPattern.color || !newPattern.daysOn || !newPattern.daysOff) {
      alert('Please fill in all fields');
      return;
    }

    const pattern: ShiftPattern = {
      id: Date.now().toString(),
      name: newPattern.name,
      color: newPattern.color,
      shiftType: selectedShiftType,
      daysOn: Number(newPattern.daysOn),
      daysOff: Number(newPattern.daysOff),
      startDate: new Date()
    };

    setPatterns([...patterns, pattern]);
    setShowPatternDialog(false);
    setNewPattern({});
  };

  const getNextFreeDayForPattern = (pattern: ShiftPattern) => {
    if (!pattern.startDate) return null;
    const today = new Date();
    let currentDate = today;
    const totalDays = pattern.daysOn + pattern.daysOff;
    
    for (let i = 0; i < 90; i++) {
      const daysSinceStart = differenceInDays(currentDate, pattern.startDate);
      const dayInCycle = daysSinceStart % totalDays;
      
      if (dayInCycle >= pattern.daysOn && currentDate >= today) {
        return currentDate;
      }
      currentDate = addDays(currentDate, 1);
    }
    return null;
  };

  const removeAlarm = async (date: Date) => {
    const updatedAlarms = alarms.filter(a => a.date !== date.toISOString());
    setAlarms(updatedAlarms);
    try {
      await LocalNotifications.cancel({
        notifications: [{ id: parseInt(date.getTime().toString()) }]
      });
    } catch (error) {
      console.error('Error removing alarm:', error);
    }
  };

  const setAlarmForShift = async (date: Date, shift: ShiftAssignment) => {
    const time = await window.prompt('Enter alarm time (HH:MM):', '08:00');
    if (!time) return;

    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      alert('Please enter a valid time in 24-hour format (HH:MM)');
      return;
    }

    const alarmDate = new Date(date);
    alarmDate.setHours(hours, minutes, 0, 0);

    const newAlarm: Alarm = {
      date: date.toISOString(),
      shiftId: shift.shiftType.name,
      time: time,
      enabled: true
    };

    setAlarms([...alarms, newAlarm]);

    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: parseInt(date.getTime().toString()),
          title: `Shift Reminder: ${shift.shiftType.name}`,
          body: `Your ${shift.shiftType.name} shift starts at ${time}`,
          schedule: { at: alarmDate }
        }]
      });
    } catch (error) {
      console.error('Error setting alarm:', error);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      <Card className="w-full mx-auto px-2 sm:px-4 py-4 flex-1">
        <div className="flex items-center justify-between mb-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentDate(prev => subMonths(prev, 1))}
                  className="px-3"
                >
                  {format(subMonths(currentDate, 1), 'MMM')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Previous month</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="text-center">
            <div className="flex items-center gap-4">
              <h2 className="text-lg sm:text-xl font-bold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
            </div>
            <div className="flex flex-col items-center gap-1 mt-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Banknote className="h-4 w-4" />
                    <span>{getDaysUntilPayday()} days until payday</span>
                  </TooltipTrigger>
                  <TooltipContent>Next payday: {format(getNextPayday(), 'MMM do')}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  onClick={() => setCurrentDate(prev => addMonths(prev, 1))}
                  className="px-3"
                >
                  {format(addMonths(currentDate, 1), 'MMM')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Next month</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div 
              key={day} 
              className="text-center text-xs sm:text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {(() => {
            const firstDayOfMonth = startOfMonth(currentDate);
            const lastDayOfMonth = endOfMonth(currentDate);
            const startWeek = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
            const endWeek = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });
            const daysToDisplay = eachDayOfInterval({ start: startWeek, end: endWeek });

            const savedSettings = localStorage.getItem('appSettings');
            const settings = savedSettings ? JSON.parse(savedSettings) : { calendarNumberLayout: 'centre' };
            const numberLayout = settings.calendarNumberLayout || 'centre';

            return daysToDisplay.map((date) => {
              const shift = getShiftForDate(date);
              const isPay = isPayday(date);
              const note = getNote(date);
              const alarm = alarms.find(a => a.date === date.toISOString());
              
              const numberPositionClasses = {
                'centre': 'left-1/2 -translate-x-1/2',
                'top-left': 'left-1',
                'top-right': 'right-1'
              }[numberLayout];
              
              return (
                <Button
                  key={date.toISOString()}
                  variant="ghost"
                  className={cn(
                    "p-0 w-full relative hover:bg-accent transition-colors flex items-center justify-center",
                    calendarSize === 'large' ? "h-20 sm:h-24" : "h-10 sm:h-12",
                    !isSameMonth(date, currentDate) && "opacity-30",
                    isToday(date) && !shift && "bg-accent",
                    theme === 'dark' && !shift && "hover:bg-accent/50 data-[state=open]:bg-accent/50"
                  )}
                  style={shift ? {
                    background: shift.shiftType.gradient,
                    color: theme === 'dark' ? 'white' : 'inherit'
                  } : undefined}
                  onClick={() => handleDayClick(date)}
                  onMouseDown={() => handleDayMouseDown(date)}
                  onMouseUp={() => handleDayMouseUp(date)}
                  onMouseEnter={() => isSelecting && handleDayMouseUp(date)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    addOrEditNote(date);
                  }}
                >
                  <span className={cn(
                    "absolute top-0.5",
                    numberPositionClasses,
                    calendarSize === 'large' ? "text-base sm:text-lg" : "text-[10px] sm:text-xs",
                    theme === 'dark' && "text-foreground"
                  )}>
                    {format(date, 'd')}
                  </span>
                  {isPay && (
                    <span 
                      className={cn(
                        "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold",
                        calendarSize === 'large' ? "text-2xl sm:text-3xl" : "text-base sm:text-lg"
                      )}
                      style={{ color: shift ? 'white' : theme === 'dark' ? '#F97316' : '#F97316' }}
                    >
                      {paydaySettings.symbol}
                    </span>
                  )}
                  {note && (
                    <StickyNote 
                      className={cn(
                        "absolute bottom-0.5 left-0.5",
                        calendarSize === 'large' ? "h-5 w-5 sm:h-6 sm:w-6" : "h-2.5 w-2.5 sm:h-3 sm:w-3"
                      )}
                      style={{ color: shift ? 'white' : theme === 'dark' ? '#F97316' : '#F97316' }}
                    />
                  )}
                  {alarm && (
                    <Bell 
                      className={cn(
                        "absolute bottom-0.5 right-0.5",
                        calendarSize === 'large' ? "h-5 w-5 sm:h-6 sm:w-6" : "h-2.5 w-2.5 sm:h-3 sm:w-3"
                      )}
                      style={{ color: shift ? 'white' : theme === 'dark' ? '#F97316' : '#F97316' }}
                    />
                  )}
                  {shift && (
                    <span className={cn(
                      "absolute bottom-0.5 font-medium",
                      calendarSize === 'large' ? "text-sm sm:text-base" : "text-[8px] sm:text-xs",
                      theme === 'dark' && "text-foreground"
                    )}>
                      {shift.shiftType.name}
                    </span>
                  )}
                </Button>
              );
            });
          })()}
        </div>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t py-4">
        <div className="container max-w-md mx-auto flex items-center justify-between px-4">
          <Button variant="ghost" size="icon" className="hover:bg-accent">
            <CalendarDays className="h-8 w-8" />
          </Button>
          
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-semibold text-xl">S</span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-accent"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
