
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShiftType } from "@/types/calendar";

interface HoursInputSectionProps {
  selectedDates: Date[];
  selectedType: ShiftType | null;
  overtimeHours: { [date: string]: number };
  setOvertimeHours: (hours: { [date: string]: number }) => void;
  showOvertimeInput: boolean;
}

export function HoursInputSection({
  selectedDates,
  selectedType,
  overtimeHours,
  setOvertimeHours,
  showOvertimeInput,
}: HoursInputSectionProps) {
  const [bulkHoursValue, setBulkHoursValue] = useState<string>("");
  const [applyMode, setApplyMode] = useState<"individual" | "same">("individual");

  const needsHoursInput = selectedType?.isOvertime || selectedType?.isTOIL || 
                         selectedType?.isSwapDone || selectedType?.isSwapOwed;
  const showHoursInput = needsHoursInput && showOvertimeInput;

  const handleBulkHoursChange = (value: string) => {
    setBulkHoursValue(value);
    const numericValue = parseFloat(value);
    
    if (!isNaN(numericValue)) {
      const newOvertimeHours = { ...overtimeHours };
      selectedDates.forEach(date => {
        newOvertimeHours[date.toISOString()] = numericValue;
      });
      setOvertimeHours(newOvertimeHours);
    }
  };

  if (!showHoursInput) return null;

  const hoursLabel = selectedType?.isOvertime 
    ? "Overtime" 
    : selectedType?.isTOIL 
      ? "TOIL" 
      : selectedType?.isSwapDone 
        ? "Swap (Done)" 
        : selectedType?.isSwapOwed 
          ? "Swap (Owed)" 
          : "";

  return (
    <>
      {selectedDates.length > 1 && (
        <div className="space-y-2 border p-3 rounded-md bg-muted/20">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">
              Bulk hours setting:
            </label>
            <Select
              value={applyMode}
              onValueChange={(value) => setApplyMode(value as "individual" | "same")}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="same">Same for all dates</SelectItem>
                <SelectItem value="individual">Set individually</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {applyMode === "same" && (
            <div className="space-y-2">
              <label className="text-sm">
                {hoursLabel} hours for all dates:
              </label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={bulkHoursValue}
                onChange={(e) => handleBulkHoursChange(e.target.value)}
                placeholder="Enter hours for all dates"
              />
            </div>
          )}
        </div>
      )}

      {(applyMode === "individual" || selectedDates.length === 1) && selectedDates.map(date => (
        <div key={date.toISOString()} className="space-y-2">
          <label className="text-sm">
            {hoursLabel} hours for {format(date, 'MMM do')}:
          </label>
          <Input
            type="number"
            min="0"
            step="0.5"
            value={overtimeHours[date.toISOString()] || ""}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              setOvertimeHours(prev => ({
                ...prev,
                [date.toISOString()]: isNaN(value) ? 0 : value
              }));
            }}
          />
        </div>
      ))}
    </>
  );
}
