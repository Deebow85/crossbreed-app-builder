
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ShiftType } from "@/types/calendar";
import { useState } from "react";

interface ShiftSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDates: Date[];
  shiftTypes: ShiftType[];
  onShiftSelect: (selectedType: ShiftType | null, overtimeHours?: { [date: string]: number }) => void;
  showOvertimeInput?: boolean;
}

export default function ShiftSelectionDialog({
  open,
  onOpenChange,
  selectedDates,
  shiftTypes,
  onShiftSelect,
  showOvertimeInput = true,
}: ShiftSelectionDialogProps) {
  const [overtimeHours, setOvertimeHours] = useState<{ [date: string]: number }>({});

  const handleShiftSelect = (shiftType: ShiftType | null) => {
    onShiftSelect(shiftType, showOvertimeInput ? overtimeHours : undefined);
    setOvertimeHours({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Set shift for {selectedDates.length === 1 
              ? format(selectedDates[0], 'MMM do, yyyy')
              : `${selectedDates.length} selected dates`}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            {shiftTypes.map((type) => (
              <Button
                key={type.name}
                style={{
                  background: type.gradient,
                }}
                onClick={() => handleShiftSelect(type)}
              >
                {type.name}
              </Button>
            ))}
          </div>

          {showOvertimeInput && selectedDates.map(date => (
            <div key={date.toISOString()} className="space-y-2">
              <label className="text-sm">
                Overtime hours for {format(date, 'MMM do')}:
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

          <Button
            variant="outline"
            onClick={() => handleShiftSelect(null)}
            className="mt-2"
          >
            Clear Shift
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
