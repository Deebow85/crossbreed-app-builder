import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Banknote, Clock, CalendarDays, StickyNote, Search, Bell } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, differenceInDays, startOfWeek, endOfWeek, addDays, setHours, setMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { LocalNotifications } from '@capacitor/local-notifications';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

type ShiftType = {
  name: string;
  color: string;
  gradient: string;
};

const shiftTypes: ShiftType[] = [
  {
    name: "Day",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #9F75FF 100%)"
  },
  {
    name: "Night",
    color: "#0EA5E9",
    gradient: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)"
  },
  {
    name: "OT",
    color: "#F97316",
    gradient: "linear-gradient(135deg, #F97316 0%, #FB923C 100%)"
  }
];

type ShiftAssignment = {
  date: string;
  shiftType: ShiftType;
  otHours?: number;
};

type PaydaySettings = {
  date: number;
  symbol: string;
};

type ShiftPattern = {
  shiftType: ShiftType;
  daysOn: number;
  daysOff: number;
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

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType>(shiftTypes[0]);
  const [shifts, setShifts] = useState<ShiftAssignment[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [paydaySettings, setPaydaySettings] = useState<PaydaySettings>({
    date: 25,
    symbol: "£"
  });
  const [pattern, setPattern] = useState<ShiftPattern>({
    shiftType: shiftTypes[0],
    daysOn: 3,
    daysOff: 3
  });
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getWeeklyOTHours = () => {
    return shifts
      .filter(shift => {
        const shiftDate = new Date(shift.date);
        return shiftDate >= weekStart && shiftDate <= weekEnd && shift.otHours;
      })
      .reduce((total, shift) => total + (shift.otHours || 0), 0);
  };

  const getMonthlyOTHours = () => {
    return shifts
      .filter(shift => {
        const shiftDate = new Date(shift.date);
        return isSameMonth(shiftDate, currentDate) && shift.otHours;
      })
      .reduce((total, shift) => total + (shift.otHours || 0), 0);
  };

  const getNextPayday = () => {
    const today = new Date();
    let nextPayday = new Date(today.getFullYear(), today.getMonth(), paydaySettings.date);
    
    if (today.getDate() > paydaySettings.date) {
      nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, paydaySettings.date);
    }
    
    return nextPayday;
  };

  const getDaysUntilPayday = () => {
    const today = new Date();
    const nextPayday = getNextPayday();
    return differenceInDays(nextPayday, today);
  };

  const isPayday = (date: Date) => {
    return date.getDate() === paydaySettings.date;
  };

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await LocalNotifications.requestPermissions();
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
      }
    };
    requestPermissions();
  }, []);

  const setAlarmForShift = async (date: Date, shift: ShiftAssignment) => {
    const dateStr = date.toISOString();
    const existingAlarm = alarms.find(a => a.date === dateStr);
    
    const timeStr = window.prompt(
      "Enter alarm time (HH:mm):",
      existingAlarm?.time || "07:00"
    );
    
    if (!timeStr) return;
    
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(timeStr)) {
      alert("Please enter a valid time in HH:mm format");
      return;
    }

    const [hours, minutes] = timeStr.split(":").map(Number);
    const alarmDate = new Date(date);
    alarmDate.setHours(hours, minutes, 0);

    if (alarmDate < new Date()) {
      alert("Cannot set alarm for past dates");
      return;
    }

    const alarmId = `${dateStr}-${shift.shiftType.name}`;

    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: Math.abs(alarmId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)),
          title: `Shift Alert: ${shift.shiftType.name}`,
          body: `Your ${shift.shiftType.name} shift starts at ${timeStr}`,
          schedule: { at: alarmDate },
          sound: 'notification.wav',
          actionTypeId: 'OPEN_SHIFT',
        }]
      });

      setAlarms(prevAlarms => {
        const filtered = prevAlarms.filter(a => a.date !== dateStr);
        return [...filtered, {
          date: dateStr,
          shiftId: alarmId,
          time: timeStr,
          enabled: true
        }];
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      alert('Failed to set alarm. Please check notification permissions.');
    }
  };

  const removeAlarm = async (date: Date) => {
    const dateStr = date.toISOString();
    const alarm = alarms.find(a => a.date === dateStr);
    
    if (!alarm) return;

    try {
      const alarmId = Math.abs(alarm.shiftId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0));
      await LocalNotifications.cancel({ notifications: [{ id: alarmId }] });
      setAlarms(alarms.filter(a => a.date !== dateStr));
    } catch (error) {
      console.error('Error removing notification:', error);
      alert('Failed to remove alarm');
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

    if (!isSelecting) {
      const existingShift = shifts.find(s => s.date === dateStr);
      if (existingShift) {
        if (existingShift.shiftType.name === "OT") {
          const hours = window.prompt("Enter OT hours:", existingShift.otHours?.toString() || "0");
          if (hours === null) return;
          
          const otHours = parseFloat(hours);
          if (isNaN(otHours) || otHours < 0) {
            alert("Please enter a valid number of hours");
            return;
          }

          if (otHours === 0) {
            setShifts(shifts.filter(s => s.date !== dateStr));
          } else {
            setShifts(shifts.map(s => 
              s.date === dateStr 
                ? { ...s, otHours } 
                : s
            ));
          }
        } else {
          setShifts(shifts.filter(s => s.date !== dateStr));
        }
      } else {
        if (selectedShiftType.name === "OT") {
          const hours = window.prompt("Enter OT hours:", "0");
          if (hours === null) return;
          
          const otHours = parseFloat(hours);
          if (isNaN(otHours) || otHours < 0) {
            alert("Please enter a valid number of hours");
            return;
          }

          if (otHours > 0) {
            setShifts([...shifts, { date: dateStr, shiftType: selectedShiftType, otHours }]);
          }
        } else {
          setShifts([...shifts, { date: dateStr, shiftType: selectedShiftType }]);
        }
      }
    }
  };

  const handleDayMouseDown = (date: Date) => {
    setIsSelecting(true);
    setSelectionStart(date.toISOString());
  };

  const handleDayMouseUp = (date: Date) => {
    if (selectionStart && isSelecting) {
      const startDate = new Date(selectionStart);
      const endDate = date;
      
      const [finalStart, finalEnd] = startDate < endDate 
        ? [startDate, endDate] 
        : [endDate, startDate];

      const dateRange = eachDayOfInterval({ start: finalStart, end: finalEnd });
      
      let otHours = 0;
      if (selectedShiftType.name === "OT") {
        const hours = window.prompt("Enter OT hours for each selected day:", "0");
        if (hours === null) {
          setIsSelecting(false);
          setSelectionStart(null);
          return;
        }
        
        otHours = parseFloat(hours);
        if (isNaN(otHours) || otHours < 0) {
          alert("Please enter a valid number of hours");
          setIsSelecting(false);
          setSelectionStart(null);
          return;
        }

        if (otHours === 0) {
          setIsSelecting(false);
          setSelectionStart(null);
          return;
        }
      }

      const newShifts = dateRange.map(date => ({
        date: date.toISOString(),
        shiftType: selectedShiftType,
        ...(selectedShiftType.name === "OT" ? { otHours } : {})
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

  const applyPattern = (startDate: Date) => {
    const totalDays = pattern.daysOn + pattern.daysOff;
    const cycleLength = 90;
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
      shiftType: selectedShiftType,
      daysOn: daysOnNum,
      daysOff: daysOffNum
    });

    const shouldApply = window.confirm(`Apply pattern: ${daysOnNum} days on, ${daysOffNum} days off with ${selectedShiftType.name} shifts?`);
    if (shouldApply) {
      applyPattern(new Date());
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

  return (
    <Card className="p-4 w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentDate(prev => subMonths(prev, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Previous month</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="text-center">
          <h2 className="text-xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex flex-col items-center gap-1 mt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Banknote className="h-4 w-4" />
                  <span>{getDaysUntilPayday()} days until payday</span>
                </TooltipTrigger>
                <TooltipContent>Next payday: {format(getNextPayday(), 'MMM do')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center justify-center gap-4 text-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>Week: {getWeeklyOTHours()}h</span>
                  </TooltipTrigger>
                  <TooltipContent>Overtime hours this week</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>Month: {getMonthlyOTHours()}h</span>
                  </TooltipTrigger>
                  <TooltipContent>Overtime hours this month</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentDate(prev => addMonths(prev, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Next month</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="relative mb-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        {searchTerm && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {searchNotes().map(({ date, text }) => (
              <div key={date} className="p-2 hover:bg-gray-100 cursor-pointer">
                <div className="font-medium text-sm">{date}</div>
                <div className="text-sm text-gray-600">{text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {shiftTypes.map((type) => (
          <TooltipProvider key={type.name}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-10",
                    selectedShiftType.name === type.name && "border-2 border-primary"
                  )}
                  style={{
                    background: type.gradient,
                    color: "white"
                  }}
                  onClick={() => setSelectedShiftType(type)}
                >
                  {type.name}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Click to select {type.name} shift</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="col-span-4 mt-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handlePatternInput}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Set Pattern ({pattern.daysOn} on, {pattern.daysOff} off)
              </Button>
            </TooltipTrigger>
            <TooltipContent>Configure recurring shift pattern</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div 
            key={day} 
            className="text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 * Math.ceil(daysInMonth.length / 7) }).map((_, index) => {
          const date = new Date(monthStart);
          date.setDate(date.getDate() - (date.getDay() || 7) + 1 + index);
          const shift = getShiftForDate(date);
          const isPay = isPayday(date);
          const note = getNote(date);
          const alarm = alarms.find(a => a.date === date.toISOString());
          
          return (
            <Button
              key={date.toISOString()}
              variant="ghost"
              className={cn(
                "h-12 p-0 w-full relative hover:bg-accent transition-colors",
                !isSameMonth(date, currentDate) && "opacity-30",
                isToday(date) && !shift && "bg-accent"
              )}
              style={shift ? {
                background: shift.shiftType.gradient,
                color: "white"
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
              <span className="absolute top-1 right-1 text-xs">
                {format(date, 'd')}
              </span>
              {isPay && (
                <span 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold"
                  style={{ color: shift ? 'white' : '#F97316' }}
                >
                  {paydaySettings.symbol}
                </span>
              )}
              {note && (
                <StickyNote 
                  className="absolute top-1 left-1 h-3 w-3"
                  style={{ color: shift ? 'white' : '#F97316' }}
                />
              )}
              {alarm && (
                <Bell 
                  className="absolute bottom-1 right-1 h-3 w-3"
                  style={{ color: shift ? 'white' : '#F97316' }}
                />
              )}
              {shift && (
                <>
                  <span className="absolute bottom-1 left-1 text-xs font-medium">
                    {shift.shiftType.name}
                  </span>
                  {shift.otHours && (
                    <span className="absolute bottom-1 right-4 text-xs font-medium">
                      {shift.otHours}h
                    </span>
                  )}
                </>
              )}
            </Button>
          );
        })}
      </div>

      <div className="mb-4 p-4 border rounded-md bg-gray-50">
        <h3 className="text-sm font-medium mb-2">Outstanding Swaps</h3>
        {getSwapSummary().map(([worker, data]) => (
          <div key={worker} className="text-sm flex justify-between items-center py-1">
            <span>{worker}</span>
            <div className="flex gap-4">
              <span className={cn(
                data.owed > data.payback ? "text-red-500" : "text-green-500"
              )}>
                {Math.abs(data.owed - data.payback)}h remaining
              </span>
              {data.monetary !== 0 && (
                <span className={cn(
                  data.monetary < 0 ? "text-red-500" : "text-green-500"
                )}>
                  {paydaySettings.symbol}{Math.abs(data.monetary)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Calendar;
