import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Banknote, CalendarDays, Settings, CheckSquare, Clock } from "lucide-react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek,
  differenceInDays 
} from "date-fns";
import { cn } from "@/lib/utils";
import { LocalNotifications } from '@capacitor/local-notifications';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useTheme } from "@/lib/theme";
import CalendarDay from "./CalendarDay";
import ShiftSelectionDialog from "./ShiftSelectionDialog";
import { getNextPayday, isPayday } from "@/utils/dateUtils";
import {
  ShiftType, ShiftAssignment, PaydaySettings, ShiftPattern,
  Note, ShiftSwap, Alarm, PatternCycle
} from "@/types/calendar";

const Calendar = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState<ShiftAssignment[]>(() => {
    const savedShifts = localStorage.getItem('calendarShifts');
    return savedShifts ? JSON.parse(savedShifts) : [];
  });
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [paydaySettings, setPaydaySettings] = useState<PaydaySettings>({
    date: 25,
    symbol: "£",
    paydayType: "monthly",
    paydayDate: 15
  });
  const [notes, setNotes] = useState<Note[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [calendarSize, setCalendarSize] = useState<'default' | 'large' | 'small'>('default');
  const [showShiftDialog, setShowShiftDialog] = useState(false);
  const [selectedDatesForShift, setSelectedDatesForShift] = useState<Date[]>([]);
  const [isSelectingMultiple, setIsSelectingMultiple] = useState(false);

  useEffect(() => {
    localStorage.setItem('calendarShifts', JSON.stringify(shifts));
  }, [shifts]);

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
    return () => window.removeEventListener('storage', loadSettings);
  }, []);

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

    if (isSelectingMultiple) {
      setSelectedDatesForShift(prev => {
        const exists = prev.some(d => d.getTime() === date.getTime());
        if (exists) {
          return prev.filter(d => d.getTime() !== date.getTime());
        }
        return [...prev, date];
      });
    } else {
      setSelectedDatesForShift([date]);
      setShowShiftDialog(true);
    }
  };

  const handleLongPress = (date: Date) => {
    setIsSelectingMultiple(true);
    setSelectedDatesForShift([date]);
  };

  const handleShiftSelection = (selectedType: ShiftType | null, overtimeHours?: { [date: string]: number }) => {
    if (selectedDatesForShift.length === 0) return;
    
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
    setIsSelectingMultiple(false);
  };

  const getShiftForDate = (date: Date) => {
    return shifts.find(shift => shift.date === date.toISOString());
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

  const savedSettings = localStorage.getItem('appSettings');
  const settings = savedSettings ? JSON.parse(savedSettings) : { 
    paydayType: 'monthly',
    paydayDate: 15,
    calendarNumberLayout: 'centre'
  };
  const numberLayout = settings.calendarNumberLayout || 'centre';

  const totalOvertimeHours = shifts.reduce((total, shift) => {
    if (!shift.otHours) return total;
    
    const savedSettings = localStorage.getItem('appSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : null;
    
    if (!settings?.overtime?.enabled) return 0;
    
    const date = new Date(shift.date);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // TODO: Add holiday check when holiday system is implemented
    const isHoliday = false;
    
    return total + shift.otHours;
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
              <h2 className="text-lg sm:text-xl font-bold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Banknote className="h-4 w-4" />
                      <span>
                        {differenceInDays(getNextPayday(settings) || new Date(), new Date()) + 1} days until payday
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Next payday: {format(getNextPayday(settings) || new Date(), 'MMM do')}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {settings?.overtime?.enabled && (
                  <div className="-mt-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{totalOvertimeHours} hours overtime</span>
                        </TooltipTrigger>
                        <TooltipContent>Total overtime hours this pay period</TooltipContent>
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
            const startWeek = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
            const endWeek = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });
            const daysToDisplay = eachDayOfInterval({ start: startWeek, end: endWeek });

            return daysToDisplay.map((date) => (
              <CalendarDay
                key={date.toISOString()}
                date={date}
                currentDate={currentDate}
                shift={getShiftForDate(date)}
                isPay={isPayday(date, settings)}
                note={getNote(date)}
                alarm={alarms.find(a => a.date === date.toISOString())}
                paydaySymbol={paydaySettings.symbol}
                calendarSize={calendarSize}
                numberLayout={numberLayout}
                onDayClick={handleDayClick}
                onLongPress={handleLongPress}
                onContextMenu={(e, date) => {
                  e.preventDefault();
                  addOrEditNote(date);
                }}
                isSelected={selectedDatesForShift.some(d => d.getTime() === date.getTime())}
              />
            ));
          })()}
        </div>
      </Card>

      <ShiftSelectionDialog
        open={showShiftDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowShiftDialog(false);
            setSelectedDatesForShift([]);
            setIsSelectingMultiple(false);
          }
        }}
        selectedDates={selectedDatesForShift}
        shiftTypes={shiftTypes}
        onShiftSelect={handleShiftSelection}
        showOvertimeInput={settings?.overtime?.enabled}
      />

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
                  setIsSelectingMultiple(!isSelectingMultiple);
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
                setIsSelectingMultiple(false);
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
    </div>
  );
};

export default Calendar;
