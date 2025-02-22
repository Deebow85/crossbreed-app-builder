
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { cn } from "@/lib/utils";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
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
          
          return (
            <Button
              key={date.toISOString()}
              variant="ghost"
              className={cn(
                "h-12 p-0 w-full relative hover:bg-accent",
                !isSameMonth(date, currentDate) && "opacity-30",
                isToday(date) && "bg-accent"
              )}
            >
              <span className="absolute top-1 right-1 text-xs">
                {format(date, 'd')}
              </span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default Calendar;
