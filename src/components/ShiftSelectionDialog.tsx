
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ShiftType } from "@/types/calendar";
import { useState, useEffect } from "react";
import { Clock, ArrowLeftRight } from "lucide-react";

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
    
    // If the shift type doesn't have overtime/TOIL/swap, or clearing the shift, submit immediately
    if (!shiftType?.isOvertime && !shiftType?.isTOIL && !shiftType?.isSwapDone && !shiftType?.isSwapOwed) {
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

  const needsHoursInput = selectedType?.isOvertime || selectedType?.isTOIL || 
                          selectedType?.isSwapDone || selectedType?.isSwapOwed;
  const showHoursInput = needsHoursInput && showOvertimeInput;

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
            {selectedType?.isOvertime ? "Edit overtime hours" : 
             selectedType?.isTOIL ? "Edit TOIL hours" : 
             selectedType?.isSwapDone || selectedType?.isSwapOwed ? "Edit swap hours" : 
             "Set shift"} for {selectedDates.length === 1 
              ? format(selectedDates[0], 'MMM do, yyyy')
              : `${selectedDates.length} selected dates`}
          </DialogTitle>
          <DialogDescription>
            Select a shift type
            {selectedType?.isOvertime && " and enter overtime hours"}
            {selectedType?.isTOIL && " and enter TOIL hours"}
            {selectedType?.isSwapDone && " and enter swap hours (done)"}
            {selectedType?.isSwapOwed && " and enter swap hours (owed)"}
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
                className="relative"
              >
                {type.name}
                {type.isOvertime && (
                  <span className="absolute top-0 right-0 bg-orange-500 text-white text-[8px] rounded-full px-1">OT</span>
                )}
                {type.isTOIL && (
                  <span className="absolute top-0 right-0 flex items-center bg-purple-500 text-white text-[8px] rounded-full px-1">
                    <Clock className="h-2 w-2 mr-0.5" />
                    TOIL
                  </span>
                )}
                {type.isSwapDone && (
                  <span className="absolute top-0 right-0 flex items-center bg-green-500 text-white text-[8px] rounded-full px-1">
                    <ArrowLeftRight className="h-2 w-2 mr-0.5" />
                    Done
                  </span>
                )}
                {type.isSwapOwed && (
                  <span className="absolute top-0 right-0 flex items-center bg-blue-500 text-white text-[8px] rounded-full px-1">
                    <ArrowLeftRight className="h-2 w-2 mr-0.5" />
                    Owed
                  </span>
                )}
              </Button>
            ))}
          </div>

          {showHoursInput && selectedDates.map(date => (
            <div key={date.toISOString()} className="space-y-2">
              <label className="text-sm">
                {selectedType?.isOvertime ? "Overtime" : 
                 selectedType?.isTOIL ? "TOIL" : 
                 selectedType?.isSwapDone ? "Swap (Done)" : 
                 selectedType?.isSwapOwed ? "Swap (Owed)" : ""} hours for {format(date, 'MMM do')}:
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

          {showHoursInput && (
            <Button onClick={handleSubmit} className="mt-2">
              {initialOvertimeHours ? "Update" : "Set"} Hours
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
