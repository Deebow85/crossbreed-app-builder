
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Banknote, Clock } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, differenceInDays, startOfWeek, endOfWeek } from "date-fns";
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
          // If it's an OT shift, prompt for hours
          const hours = window.prompt("Enter OT hours:", existingShift.otHours?.toString() || "0");
          if (hours === null) return; // User cancelled
          
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
          // If assigning an OT shift, prompt for hours
          const hours = window.prompt("Enter OT hours:", "0");
          if (hours === null) return; // User cancelled
          
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
          return; // User cancelled
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

      <div className="grid grid-cols-3 gap-2 mb-4">
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
