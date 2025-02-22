
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
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
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType>(shiftTypes[0]);
  const [shifts, setShifts] = useState<ShiftAssignment[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const previousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString();
    
    if (!isSelecting) {
      // Single day selection
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
    if (selectionStart && isSelecting) {
      const startDate = new Date(selectionStart);
      const endDate = date;
      
      // Ensure start date is before end date
      const [finalStart, finalEnd] = startDate < endDate 
        ? [startDate, endDate] 
        : [endDate, startDate];

      // Create array of dates between start and end
      const dateRange = eachDayOfInterval({ start: finalStart, end: finalEnd });
      
      // Add shifts for all dates in range
      const newShifts = dateRange.map(date => ({
        date: date.toISOString(),
        shiftType: selectedShiftType
      }));

      // Remove any existing shifts in the range and add new ones
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
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={previousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <Button 
          variant="outline" 
          size="icon"
          onClick={nextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Shift Type Selection */}
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

      {/* Weekday Headers */}
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

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 * Math.ceil(daysInMonth.length / 7) }).map((_, index) => {
          const date = new Date(monthStart);
          date.setDate(date.getDate() - (date.getDay() || 7) + 1 + index);
          const shift = getShiftForDate(date);
          
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
              {shift && (
                <span className="absolute bottom-1 left-1 text-xs font-medium">
                  {shift.shiftType.name}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default Calendar;
