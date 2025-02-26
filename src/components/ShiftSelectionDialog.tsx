
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ShiftType } from "@/types/calendar";
import { useState, useEffect } from "react";

interface ShiftSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDates: Date[];
  shiftTypes: ShiftType[];
  onShiftSelect: (selectedType: ShiftType | null, overtimeHours?: { [date: string]: number }) => void;
  showOvertimeInput?: boolean;
  initialShiftType?: ShiftType;
  initialOvertimeHours?: { [date: string]: number };
}

export default function ShiftSelectionDialog({
  open,
  onOpenChange,
  selectedDates,
  shiftTypes,
  onShiftSelect,
  showOvertimeInput = true,
  initialShiftType,
  initialOvertimeHours,
}: ShiftSelectionDialogProps) {
  const [overtimeHours, setOvertimeHours] = useState<{ [date: string]: number }>(initialOvertimeHours || {});
  const [selectedType, setSelectedType] = useState<ShiftType | null>(initialShiftType || null);

  useEffect(() => {
    if (open && initialShiftType) {
      setSelectedType(initialShiftType);
      setOvertimeHours(initialOvertimeHours || {});
    }
  }, [open, initialShiftType, initialOvertimeHours]);

  const handleShiftSelect = (shiftType: ShiftType | null) => {
    setSelectedType(shiftType);
    
    // If the shift type doesn't have overtime, or clearing the shift, submit immediately
    if (!shiftType?.isOvertime) {
      onShiftSelect(shiftType, undefined);
      setOvertimeHours({});
      setSelectedType(null);
    }
  };

  const handleSubmit = () => {
    if (selectedType) {
      onShiftSelect(selectedType, overtimeHours);
      setOvertimeHours({});
      setSelectedType(null);
    }
  };

  const showOTInput = selectedType?.isOvertime && showOvertimeInput;

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setSelectedType(null);
          setOvertimeHours({});
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedType?.isOvertime ? "Edit overtime hours" : "Set shift"} for {selectedDates.length === 1 
              ? format(selectedDates[0], 'MMM do, yyyy')
              : `${selectedDates.length} selected dates`}
          </DialogTitle>
          <DialogDescription>
            Select a shift type{selectedType?.isOvertime ? " and enter overtime hours" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            {shiftTypes.map((type) => (
              <Button
                key={type.name}
                style={{
                  background: type.gradient,
                }}
                variant={selectedType?.name === type.name ? "default" : "secondary"}
                onClick={() => handleShiftSelect(type)}
              >
                {type.name}
              </Button>
            ))}
          </div>

          {showOTInput && selectedDates.map(date => (
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

          {showOTInput && (
            <Button onClick={handleSubmit} className="mt-2">
              {initialOvertimeHours ? "Update" : "Set"} Overtime Hours
            </Button>
          )}

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
