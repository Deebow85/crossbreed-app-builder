
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Banknote, CalendarDays, Settings, CheckSquare, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek,
  isSameMonth,
  differenceInDays,
  addYears,
  subYears,
  setMonth,
  setYear,
  addDays,
  parseISO
} from "date-fns";
import { cn } from "@/lib/utils";
import { LocalNotifications } from '@capacitor/local-notifications';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/lib/theme";
import CalendarDay from "./CalendarDay";
import ShiftSelectionDialog from "./ShiftSelectionDialog";
import NoteEditDialog from "./NoteEditDialog";
import { getNextPayday, isPayday } from "@/utils/dateUtils";
import { useToast } from "@/hooks/use-toast";
import {
  ShiftType, ShiftAssignment, PaydaySettings, ShiftPattern,
  Note, ShiftSwap, Alarm, PatternCycle
} from "@/types/calendar";

type CalendarProps = {
  isSelectingMultiple?: boolean;
};

const Calendar = ({ isSelectingMultiple = false }: CalendarProps) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState<ShiftAssignment[]>(() => {
    const savedShifts = localStorage.getItem('calendarShifts');
    const savedSettings = localStorage.getItem('appSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    const currentShiftTypes = settings.shiftTypes || [];
    
    if (savedShifts) {
      const parsedShifts = JSON.parse(savedShifts);
      // Update existing shifts with latest shift type data
      return parsedShifts.map((shift: ShiftAssignment) => {
        const updatedShiftType = currentShiftTypes.find((type: ShiftType) => type.name === shift.shiftType.name);
        return updatedShiftType ? { ...shift, shiftType: updatedShiftType } : shift;
      });
    }
    return [];
  });
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [paydaySettings, setPaydaySettings] = useState<PaydaySettings>({
    date: 25,
    symbol: "£",
    paydayType: "monthly",
    paydayDate: 15
  });
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('calendarNotes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [calendarSize, setCalendarSize] = useState<'default' | 'large' | 'small'>('default');
  const [showShiftDialog, setShowShiftDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [selectedDatesForShift, setSelectedDatesForShift] = useState<Date[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentDate(setMonth(currentDate, monthIndex));
    setShowDatePicker(false);
  };

  const handleYearSelect = (year: number) => {
    setCurrentDate(setYear(currentDate, year));
  };

  useEffect(() => {
    localStorage.setItem('calendarShifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('calendarNotes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setCalendarSize(settings.calendarSize || 'small');
        if (settings.shiftTypes) {
          setShiftTypes(settings.shiftTypes);
        }
        if (settings.paydayDate !== undefined) {
          setPaydaySettings(prev => ({
            ...prev,
            paydayType: settings.paydayType || 'monthly',
            paydayDate: settings.paydayDate || 15
          }));
        }
      }
    };

    loadSettings();
    window.addEventListener('storage', loadSettings);
    
    // Check for pattern data and apply if present
    const patternData = sessionStorage.getItem('patternData');
    if (patternData) {
      const data = JSON.parse(patternData);
      console.log('Applying pattern data:', data);
      applyShiftPattern(data);
      // Clear pattern data after applying to prevent reapplication on refresh
      sessionStorage.removeItem('patternData');
    }
    
    return () => window.removeEventListener('storage', loadSettings);
  }, []);

  // **************************************************************************
  // WARNING: DO NOT MODIFY THE PATTERN LOGIC BELOW WITHOUT CAREFUL REVIEW
  // This pattern algorithm has been carefully tested and validated.
  //
  // How the pattern works:
  // 1. Steps in pattern.sequences are each shift type with its duration in days
  // 2. The entire sequence is repeated for pattern.repeatTimes 
  // 3. After ALL repeats are done, pattern.daysOffAfter days are added at the end
  // 4. This entire super-cycle is repeated enough times to cover the years specified
  //
  // IMPORTANT: Days off within sequences (isOff: true) are different from daysOffAfter!
  // Days off *within* a pattern sequence are regular days off in the rotation.
  // Days off *after* all repeats (daysOffAfter) are added at the very end of all cycles.
  // **************************************************************************
  const applyShiftPattern = (patternData: any) => {
    // Make sure we have valid data
    if (!patternData?.pattern?.sequences || !patternData.startDate) {
      console.error('Invalid pattern data:', patternData);
      return;
    }

    try {
      const { pattern, startDate, years } = patternData;
      const startDateObj = typeof startDate === 'string' ? 
        new Date(startDate) : new Date();
      
      if (isNaN(startDateObj.getTime())) {
        console.error('Invalid start date:', startDate);
        return;
      }

      // Generate shifts based on pattern
      const newShifts: ShiftAssignment[] = [];
      let currentDay = new Date(startDateObj);
      let totalDays = 0;
      
      // Calculate how many full super-cycles we need for the specified years
      // A super-cycle is: (sequence repeated X times) + days off after
      const daysPerYear = 365.25; // Account for leap years
      const totalDaysNeeded = years * daysPerYear;
      
      // Calculate days in one super-cycle
      const daysInSequence = pattern.sequences.reduce((sum, seq) => sum + seq.days, 0);
      const daysInRepeatPattern = daysInSequence * pattern.repeatTimes;
      const daysInSuperCycle = daysInRepeatPattern + pattern.daysOffAfter;
      
      // Calculate how many super-cycles we need
      const superCyclesNeeded = Math.ceil(totalDaysNeeded / daysInSuperCycle);
      
      console.log(`Pattern will be applied for ${superCyclesNeeded} super-cycles to cover ${years} years`);
      
      // For each super-cycle
      for (let superCycle = 0; superCycle < superCyclesNeeded; superCycle++) {
        // First, repeat the sequence the specified number of times
        for (let repeatCount = 0; repeatCount < pattern.repeatTimes; repeatCount++) {
          // Process each sequence in the pattern
          for (const sequence of pattern.sequences) {
            // Process each day in this sequence
            for (let day = 0; day < sequence.days; day++) {
              // If this is not a day off and has a shift type, add a shift
              if (!sequence.isOff && sequence.shiftType) {
                newShifts.push({
                  date: currentDay.toISOString(),
                  shiftType: sequence.shiftType
                });
              }
              // Always advance to the next day
              currentDay = addDays(currentDay, 1);
              totalDays++;
            }
          }
        }
        
        // After completing all the repeated sequences, add the days off
        if (pattern.daysOffAfter > 0) {
          currentDay = addDays(currentDay, pattern.daysOffAfter);
          totalDays += pattern.daysOffAfter;
        }
      }

      console.log(`Generated ${newShifts.length} shifts from pattern over ${totalDays} days`);
      
      // Merge new shifts with existing ones, replacing overlapping dates
      setShifts(prevShifts => {
        const existingShiftDates = new Map(
          prevShifts.map(shift => [shift.date, shift])
        );
        
        newShifts.forEach(shift => {
          existingShiftDates.set(shift.date, shift);
        });
        
        return Array.from(existingShiftDates.values());
      });

    } catch (error) {
      console.error('Error applying shift pattern:', error);
    }
  };
  // **************************************************************************
  // END OF PATTERN LOGIC - SEE WARNING ABOVE
  // **************************************************************************

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

    if (shift?.shiftType.isOvertime && shift.otHours !== undefined) {
      setSelectedDatesForShift([date]);
      setShowShiftDialog(true);
      return;
    }

    if (isSelectingMultiple) {
      setSelectedDatesForShift(prev => {
        const dateExists = prev.some(d => d.getTime() === date.getTime());
        if (dateExists) {
          return prev.filter(d => d.getTime() !== date.getTime());
        }
        return [...prev, date];
      });
    } else {
      setSelectedDatesForShift([date]);
      setShowShiftDialog(true);
    }
  };

  const handleNoteClick = () => {
    if (selectedDatesForShift.length > 0) {
      setShowShiftDialog(false);
      setShowNoteDialog(true);
    }
  };

  const handleLongPress = (date: Date) => {
    // setIsSelectingMultiple(true); // This is now handled in the Index page
    setSelectedDatesForShift([date]);
  };

  const handleShiftSelection = (selectedType: ShiftType | null, overtimeHours?: { [date: string]: number }) => {
    if (selectedDatesForShift.length === 0) return;
    
    // Handle swap owed and done shifts, and TOIL
    if ((selectedType?.isSwapOwed || selectedType?.isSwapDone || selectedType?.isTOIL) && selectedDatesForShift.length === 1) {
      const selectedDate = selectedDatesForShift[0];
      // Store the date in sessionStorage for the NotesTracking page
      sessionStorage.setItem('selectedSwapDate', selectedDate.toISOString());
      
      if (selectedType.isSwapOwed || selectedType.isSwapDone) {
        sessionStorage.setItem('recordType', 'swap');
        sessionStorage.setItem('swapType', selectedType.isSwapOwed ? 'owed' : 'payback');
      } else if (selectedType.isTOIL) {
        sessionStorage.setItem('recordType', 'toil');
      }
      
      navigate('/notes-tracking');
      return;
    }

    setShifts(prevShifts => {
      const newShifts = [...prevShifts];
      selectedDatesForShift.forEach(date => {
        const dateStr = date.toISOString();
        const existingIndex = newShifts.findIndex(s => s.date === dateStr);
        
        if (selectedType) {
          const shiftData = {
            date: dateStr,
            shiftType: selectedType,
            otHours: overtimeHours?.[dateStr]
          };
          
          if (existingIndex >= 0) {
            newShifts[existingIndex] = shiftData;
          } else {
            newShifts.push(shiftData);
          }
        } else {
          if (existingIndex >= 0) {
            newShifts.splice(existingIndex, 1);
          }
        }
      });
      return newShifts;
    });
    
    setShowShiftDialog(false);
    setSelectedDatesForShift([]);
    // setIsSelectingMultiple(false); // This is now handled in the Index page
  };

  const handleSaveNote = (note: Note) => {
    setNotes(prevNotes => {
      const existingIndex = prevNotes.findIndex(n => n.date === note.date);
      if (existingIndex >= 0) {
        const updatedNotes = [...prevNotes];
        updatedNotes[existingIndex] = note;
        return updatedNotes;
      } else {
        return [...prevNotes, note];
      }
    });

    toast({
      title: "Note saved",
      description: "Your note has been saved to the calendar."
    });
  };

  const handleDeleteNote = (dateStr: string) => {
    setNotes(prevNotes => prevNotes.filter(n => n.date !== dateStr));
    toast({
      title: "Note deleted",
      description: "The note has been removed."
    });
  };

  const [swaps, setSwaps] = useState<ShiftSwap[]>(() => {
    const savedSwaps = localStorage.getItem('swaps');
    return savedSwaps ? JSON.parse(savedSwaps) : [];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const savedSwaps = localStorage.getItem('swaps');
      const savedNotes = localStorage.getItem('notes');
      const savedSettings = localStorage.getItem('appSettings');
      const savedShifts = localStorage.getItem('calendarShifts');

      if (savedSwaps) {
        setSwaps(JSON.parse(savedSwaps));
      }
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.shiftTypes) {
          setShiftTypes(settings.shiftTypes);
          
          // Update existing shifts with new shift type data
          if (savedShifts) {
            const parsedShifts = JSON.parse(savedShifts);
            const updatedShifts = parsedShifts.map((shift: ShiftAssignment) => {
              const updatedShiftType = settings.shiftTypes.find((type: ShiftType) => type.name === shift.shiftType.name);
              return updatedShiftType ? { ...shift, shiftType: updatedShiftType } : shift;
            });
            setShifts(updatedShifts);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getShiftForDate = (date: Date) => {
    const dateStr = date.toISOString();
    const regularShift = shifts.find(shift => shift.date === dateStr);
    if (regularShift) return regularShift;

    // Check for swaps and TOIL
    const swap = swaps.find(s => s.date === format(date, "yyyy-MM-dd"));
    const toilNote = notes.find(n => n.date === format(date, "yyyy-MM-dd") && n.toilType);

    if (swap) {
      // Find the appropriate shift type from user settings
      const swapShiftType = shiftTypes.find(type => 
        swap.type === 'owed' ? type.isSwapOwed : type.isSwapDone
      );
      
      if (swapShiftType) {
        return {
          date: dateStr,
          shiftType: swapShiftType
        };
      } else {
        // Fallback to default if no custom shift type is found
        return {
          date: dateStr,
          shiftType: {
            name: `Swap ${swap.type === 'owed' ? 'Owed' : 'Done'}`,
            color: swap.type === 'owed' ? '#FF6B6B' : '#4CAF50',
            gradient: swap.type === 'owed' ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)' : 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
            isSwapOwed: swap.type === 'owed',
            isSwapDone: swap.type === 'payback',
            symbol: swap.type === 'owed' ? 'SO' : 'SD'
          }
        };
      }
    }

    if (toilNote) {
      // Find the appropriate TOIL shift type from user settings
      const toilShiftType = shiftTypes.find(type => type.isTOIL);
      
      if (toilShiftType) {
        return {
          date: dateStr,
          shiftType: toilShiftType
        };
      } else {
        // Fallback to default if no custom shift type is found
        return {
          date: dateStr,
          shiftType: {
            name: `TOIL ${toilNote.toilType === 'taken' ? 'Taken' : 'Done'}`,
            color: '#9C27B0',
            gradient: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
            isTOIL: true,
            symbol: 'T'
          }
        };
      }
    }

    return undefined;
  };

  const addOrEditNote = (date: Date) => {
    setSelectedDatesForShift([date]);
    setShowNoteDialog(true);
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

  const getNote = (date: Date): Note | undefined => {
    return notes.find(note => note.date === date.toISOString());
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const storedSettings = localStorage.getItem('appSettings');
  const parsedSettings = storedSettings ? JSON.parse(storedSettings) : {};

  const getSettingValue = <T,>(key: string, defaultValue: T): T => {
    return parsedSettings[key] !== undefined ? parsedSettings[key] : defaultValue;
  };

  const calendarSettings = {
    paydayEnabled: getSettingValue('paydayEnabled', true),
    overtime: getSettingValue('overtime', { enabled: false }),
    paydayType: getSettingValue('paydayType', 'monthly'),
    paydayDate: getSettingValue('paydayDate', 15),
    paydayColor: getSettingValue('paydayColor', '#F97316'),
    calendarNumberLayout: getSettingValue('calendarNumberLayout', 'centre'),
    showOverlappingDates: getSettingValue('showOverlappingDates', true),
    shiftVisualizerType: getSettingValue('shiftVisualizerType', 'colour'),
    shiftVisualizerTypes: Array.isArray(parsedSettings.shiftVisualizerTypes) ? parsedSettings.shiftVisualizerTypes : ['colour']
  } as const;
  
  const totalOvertimeHours = shifts.reduce((total, shift) => {
    if (!shift.otHours) return total;
    
    if (!calendarSettings.overtime?.enabled) return total;

    // Check if we should only count shifts marked specifically as "Overtime" type
    const onlyTrackOvertimeType = parsedSettings.overtime?.onlyTrackOvertimeType !== false; // Default to true if not specified
    if (onlyTrackOvertimeType && !shift.shiftType.isOvertime) {
      return total;
    }
    
    const date = new Date(shift.date);
    const currentMonthStart = startOfMonth(currentDate);
    const currentMonthEnd = endOfMonth(currentDate);

    if (date >= currentMonthStart && date <= currentMonthEnd) {
      return total + shift.otHours;
    }
    
    return total;
  }, 0);

  return (
    <div className="relative flex flex-col min-h-screen pb-20">
      <Card className="w-full mx-auto px-2 sm:px-4 py-4 flex-1">
        <div className="flex items-center justify-between mb-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentDate(prev => subMonths(prev, 1))}
                  className="px-3 h-8 self-start"
                >
                  {format(subMonths(currentDate, 1), 'MMM')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Previous month</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="text-center flex-1 mx-4">
            <div className="flex items-center justify-center mb-2">
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="text-lg sm:text-xl font-bold hover:bg-accent"
                  >
                    {format(currentDate, 'MMMM yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="center">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleYearSelect(currentYear - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="font-semibold">{currentYear}</span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleYearSelect(currentYear + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {months.map((month, index) => (
                        <Button
                          key={month}
                          variant={index === currentMonthIndex ? "default" : "outline"}
                          className="w-full text-sm"
                          onClick={() => handleMonthSelect(index)}
                        >
                          {month.slice(0, 3)}
                        </Button>
                      ))}
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {years.map(year => (
                        <Button
                          key={year}
                          variant={year === currentYear ? "default" : "outline"}
                          className="w-full text-sm"
                          onClick={() => handleYearSelect(year)}
                        >
                          {year}
                        </Button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                {calendarSettings.paydayEnabled && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Banknote className="h-4 w-4" />
                        <span>
                          {differenceInDays(getNextPayday(calendarSettings) || new Date(), new Date()) + 1} days until payday
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Next payday: {format(getNextPayday(calendarSettings) || new Date(), 'MMM do')}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {calendarSettings.overtime?.enabled && (
                  <div className="-mt-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{totalOvertimeHours} hours overtime</span>
                        </TooltipTrigger>
                        <TooltipContent>Total overtime hours for {format(currentDate, 'MMMM yyyy')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </div>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  onClick={() => setCurrentDate(prev => addMonths(prev, 1))}
                  className="px-3 h-8 self-start"
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
            
            let daysToDisplay: Date[];
            
            if (calendarSettings.showOverlappingDates) {
              const startWeek = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
              const endWeek = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });
              daysToDisplay = eachDayOfInterval({ start: startWeek, end: endWeek });
            } else {
              daysToDisplay = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
              
              const emptyDaysBefore = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
              for (let i = 0; i < emptyDaysBefore; i++) {
                daysToDisplay.unshift(new Date(0));
              }
              
              const lastDayOfWeek = lastDayOfMonth.getDay() === 0 ? 7 : lastDayOfMonth.getDay();
              const emptyDaysAfter = 7 - lastDayOfWeek;
              for (let i = 0; i < emptyDaysAfter; i++) {
                daysToDisplay.push(new Date(0));
              }
            }

            return daysToDisplay.map((date) => {
              if (date.getTime() === 0) {
                return <div key={Math.random()} className="h-10 sm:h-12" />;
              }

              return (
                <CalendarDay
                  key={date.toISOString()}
                  date={date}
                  currentDate={currentDate}
                  shift={getShiftForDate(date)}
                  isPay={isPayday(date, calendarSettings)}
                  note={getNote(date)}
                  alarm={alarms.find(a => a.date === date.toISOString())}
                  paydaySymbol={paydaySettings.symbol}
                  paydayColor={calendarSettings.paydayColor}
                  calendarSize={calendarSize}
                  numberLayout={calendarSettings.calendarNumberLayout}
                  onDayClick={handleDayClick}
                  onLongPress={handleLongPress}
                  onContextMenu={(e, date) => {
                    e.preventDefault();
                    addOrEditNote(date);
                  }}
                  isSelected={selectedDatesForShift.some(d => d.getTime() === date.getTime())}
                  showPayday={calendarSettings.paydayEnabled}
                  visualizerTypes={Array.isArray(calendarSettings.shiftVisualizerTypes) && calendarSettings.shiftVisualizerTypes.length > 0 
                    ? calendarSettings.shiftVisualizerTypes 
                    : [calendarSettings.shiftVisualizerType || 'colour']}
                />
              );
            });
          })()}
        </div>
      </Card>

      <ShiftSelectionDialog
        open={showShiftDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowShiftDialog(false);
            setSelectedDatesForShift([]);
            // setIsSelectingMultiple(false); // This is now handled in the Index page
          }
        }}
        selectedDates={selectedDatesForShift}
        shiftTypes={shiftTypes}
        onShiftSelect={handleShiftSelection}
        showOvertimeInput={calendarSettings.overtime?.enabled}
        initialShiftType={selectedDatesForShift.length === 1 
          ? getShiftForDate(selectedDatesForShift[0])?.shiftType 
          : undefined}
        initialOvertimeHours={selectedDatesForShift.length === 1 
          ? getShiftForDate(selectedDatesForShift[0])?.otHours !== undefined
            ? { [selectedDatesForShift[0].toISOString()]: getShiftForDate(selectedDatesForShift[0])!.otHours! }
            : undefined
          : undefined}
        onNoteClick={handleNoteClick}
        hasNote={selectedDatesForShift.length === 1 && !!getNote(selectedDatesForShift[0])}
      />

      <NoteEditDialog
        open={showNoteDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowNoteDialog(false);
          }
        }}
        date={selectedDatesForShift.length > 0 ? selectedDatesForShift[0] : null}
        existingNote={selectedDatesForShift.length > 0 ? getNote(selectedDatesForShift[0]) : undefined}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />

      {isSelectingMultiple && (
        <div className="fixed bottom-24 left-0 right-0 bg-background border-t py-2 px-4 flex items-center justify-between animate-in slide-in-from-bottom z-40">
          <div className="text-sm">
            {selectedDatesForShift.length} dates selected
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // setIsSelectingMultiple(false); // This is now handled in the Index page
                setSelectedDatesForShift([]);
              }}
            >
              Cancel
            </Button>
            {selectedDatesForShift.length > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowShiftDialog(true)}
              >
                Set Shifts
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t py-4 z-50">
        <div className="container max-w-md mx-auto px-4">
          <div className="relative flex items-center">
            <div className="flex-1 flex justify-start gap-4">
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <CalendarDays className="h-8 w-8" />
              </Button>
              <Button
                variant={isSelectingMultiple ? "secondary" : "ghost"}
                size="icon"
                onClick={() => {
                  // setIsSelectingMultiple(!isSelectingMultiple); // This is now handled in the Index page
                  if (isSelectingMultiple) {
                    setSelectedDatesForShift([]);
                  }
                }}
                className="hover:bg-accent"
              >
                <CheckSquare className="h-8 w-8" />
              </Button>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90"
                onClick={() => navigate("/shift-setup")}
              >
                <span className="text-primary-foreground font-semibold text-xl">S</span>
              </Button>
            </div>

            <div className="flex-1 flex justify-end">
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
      </div>
    </div>
  );
};

export default Calendar;
