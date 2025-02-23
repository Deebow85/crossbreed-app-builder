import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Banknote, CalendarDays, Settings, CheckSquare } from "lucide-react";
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

const shiftTypes: ShiftType[] = [
  {
    name: "Day",
    color: "#4CAF50",
    gradient: "linear-gradient(135deg, #4CAF50 0%, #81C784 100%)"
  },
  {
    name: "Night",
    color: "#2196F3",
    gradient: "linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)"
  },
  {
    name: "Late",
    color: "#9C27B0",
    gradient: "linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)"
  },
  {
    name: "Early",
    color: "#FF9800",
    gradient: "linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)"
  }
];

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

    if (isSelectingMultiple && selectedDatesForShift.length > 0) {
      setShowShiftDialog(true);
    }
  };

  const handleShiftSelection = (selectedType: ShiftType | null) => {
    if (selectedDatesForShift.length === 0) return;
    
    setShifts(prevShifts => {
      const newShifts = [...prevShifts];
      selectedDatesForShift.forEach(date => {
        const dateStr = date.toISOString();
        const existingIndex = newShifts.findIndex(s => s.date === dateStr);
        
        if (selectedType) {
          if (existingIndex >= 0) {
            newShifts[existingIndex] = { date: dateStr, shiftType: selectedType };
          } else {
            newShifts.push({ date: dateStr, shiftType: selectedType });
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
  const settings = savedSettings ? JSON.parse(savedSettings) : { calendarNumberLayout: 'centre' };
  const numberLayout = settings.calendarNumberLayout || 'centre';

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

          <div className="text-center flex-1 mx-4">
            <div className="flex items-center justify-center gap-4">
              <h2 className="text-lg sm:text-xl font-bold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
            </div>
            <div className="flex flex-col items-center gap-1 mt-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Banknote className="h-4 w-4" />
                    <span>{differenceInDays(getNextPayday(settings), new Date())} days until payday</span>
                  </TooltipTrigger>
                  <TooltipContent>Next payday: {format(getNextPayday(settings), 'MMM do')}</TooltipContent>
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

        <div className="flex items-center justify-between mb-4">
          <Button
            variant={isSelectingMultiple ? "secondary" : "outline"}
            size="sm"
            onClick={() => {
              setIsSelectingMultiple(!isSelectingMultiple);
              if (!isSelectingMultiple) {
                setSelectedDatesForShift([]);
              }
            }}
            className="flex items-center gap-2"
          >
            <CheckSquare className="h-4 w-4" />
            {isSelectingMultiple ? "Done Selecting" : "Select Multiple"}
          </Button>
          {isSelectingMultiple && selectedDatesForShift.length > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowShiftDialog(true)}
            >
              Set {selectedDatesForShift.length} Shifts
            </Button>
          )}
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
      />

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
