import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Banknote, Clock, CalendarDays, StickyNote, Search } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, differenceInDays, startOfWeek, endOfWeek, addDays } from "date-fns";
import { cn } from "@/lib/utils";

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

  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString();
    
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
    const noteText = window.prompt(
      "Enter note for " + format(date, 'MMM d, yyyy'),
      existingNote?.text || ""
    );

    if (noteText === null) return; // User cancelled

    if (noteText.trim() === "") {
      setNotes(notes.filter(note => note.date !== dateStr));
    } else {
      setNotes(prevNotes => {
        const filtered = prevNotes.filter(note => note.date !== dateStr);
        return [...filtered, { date: dateStr, text: noteText.trim() }];
      });
    }
  };

  const getNote = (date: Date): Note | undefined => {
    return notes.find(note => note.date === date.toISOString());
  };

  const searchNotes = () => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return notes
      .filter(note => note.text.toLowerCase().includes(term))
      .map(note => ({
        ...note,
        date: format(new Date(note.date), 'MMM d, yyyy')
      }));
  };

  return (
    <Card className="p-4 w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setCurrentDate(prev => subMonths(prev, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <h2 className="text-xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex flex-col items-center gap-1 mt-1">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Banknote className="h-4 w-4" />
              <span>{getDaysUntilPayday()} days until payday</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>Week: {getWeeklyOTHours()}h</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>Month: {getMonthlyOTHours()}h</span>
              </div>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setCurrentDate(prev => addMonths(prev, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
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
          <Button
            key={type.name}
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
        ))}
        <Button
          variant="outline"
          className="col-span-4 mt-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handlePatternInput}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          Set Pattern ({pattern.daysOn} on, {pattern.daysOff} off)
        </Button>
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
              {shift && (
                <>
                  <span className="absolute bottom-1 left-1 text-xs font-medium">
                    {shift.shiftType.name}
                  </span>
                  {shift.otHours && (
                    <span className="absolute bottom-1 right-1 text-xs font-medium">
                      {shift.otHours}h
                    </span>
                  )}
                </>
              )}
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default Calendar;
