
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ShiftType } from "@/types/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";

type ShiftSelectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDates: Date[];
  shiftTypes: ShiftType[];
  onShiftSelect: (type: ShiftType | null, overtimeHours?: { [date: string]: number }) => void;
};

const ShiftSelectionDialog = ({
  open,
  onOpenChange,
  selectedDates,
  shiftTypes,
  onShiftSelect,
}: ShiftSelectionDialogProps) => {
  const [overtimeHours, setOvertimeHours] = useState<{ [date: string]: string }>({});
  const [selectedType, setSelectedType] = useState<ShiftType | null>(null);

  const handleShiftSelect = (type: ShiftType | null) => {
    setSelectedType(type);
    if (!type?.isOvertime) {
      onShiftSelect(type);
      setOvertimeHours({});
    }
  };

  const handleOvertimeConfirm = () => {
    if (selectedType) {
      const validHours: { [date: string]: number } = {};
      let isValid = true;

      // Validate all overtime entries
      selectedDates.forEach(date => {
        const dateStr = date.toISOString();
        const hours = parseFloat(overtimeHours[dateStr] || '0');
        if (isNaN(hours) || hours <= 0) {
          isValid = false;
        } else {
          validHours[dateStr] = hours;
        }
      });

      if (isValid && Object.keys(validHours).length > 0) {
        onShiftSelect(selectedType, validHours);
      }
    }
  };

  const handleHoursChange = (date: Date, value: string) => {
    setOvertimeHours(prev => ({
      ...prev,
      [date.toISOString()]: value
    }));
  };

  const areAllHoursValid = () => {
    return selectedDates.every(date => {
      const hours = parseFloat(overtimeHours[date.toISOString()] || '0');
      return !isNaN(hours) && hours > 0;
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        setOvertimeHours({});
        setSelectedType(null);
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Shift</DialogTitle>
          <DialogDescription>
            {selectedDates.length === 1 
              ? `Select shift type for ${format(selectedDates[0], 'MMMM d, yyyy')}`
              : `Select shift type for ${selectedDates.length} dates`
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {shiftTypes.map((type) => (
            <Button
              key={type.name}
              onClick={() => handleShiftSelect(type)}
              className={`w-full justify-start ${
                selectedType?.name === type.name ? 'ring-2 ring-primary' : ''
              }`}
              style={{
                background: type.gradient,
                color: 'white'
              }}
            >
              {type.name}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => handleShiftSelect(null)}
            className="w-full justify-start"
          >
            Remove Shift
          </Button>

          {selectedType?.isOvertime && (
            <ScrollArea className="h-[200px]">
              <div className="space-y-4 p-4 border rounded-lg bg-orange-50/50">
                <Label>Overtime Hours Per Day</Label>
                {selectedDates.map((date) => (
                  <div key={date.toISOString()} className="space-y-2">
                    <Label htmlFor={`ot-${date.toISOString()}`} className="text-sm">
                      {format(date, 'MMMM d, yyyy')}
                    </Label>
                    <Input
                      id={`ot-${date.toISOString()}`}
                      type="number"
                      step="0.5"
                      min="0"
                      value={overtimeHours[date.toISOString()] || ''}
                      onChange={(e) => handleHoursChange(date, e.target.value)}
                      placeholder="Enter overtime hours"
                      className="flex-1"
                    />
                  </div>
                ))}
                <Button 
                  onClick={handleOvertimeConfirm}
                  disabled={!areAllHoursValid()}
                  className="w-full mt-4"
                >
                  Confirm All Hours
                </Button>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftSelectionDialog;
