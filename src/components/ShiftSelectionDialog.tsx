
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ShiftType } from "@/types/calendar";

type ShiftSelectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDates: Date[];
  shiftTypes: ShiftType[];
  onShiftSelect: (type: ShiftType | null, otHours?: number) => void;
};

const ShiftSelectionDialog = ({
  open,
  onOpenChange,
  selectedDates,
  shiftTypes,
  onShiftSelect,
}: ShiftSelectionDialogProps) => {
  const [overtimeHours, setOvertimeHours] = useState<string>("");
  const [selectedType, setSelectedType] = useState<ShiftType | null>(null);

  const handleShiftSelect = (type: ShiftType | null) => {
    setSelectedType(type);
    if (!type?.isOvertime) {
      onShiftSelect(type);
      setOvertimeHours("");
    }
  };

  const handleOvertimeConfirm = () => {
    if (selectedType) {
      const hours = parseFloat(overtimeHours);
      if (!isNaN(hours) && hours > 0) {
        onShiftSelect(selectedType, hours);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        setOvertimeHours("");
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
            <div className="space-y-2 p-4 border rounded-lg bg-orange-50/50">
              <Label htmlFor="overtimeHours">Overtime Hours</Label>
              <div className="flex gap-2">
                <Input
                  id="overtimeHours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(e.target.value)}
                  placeholder="Enter overtime hours"
                  className="flex-1"
                />
                <Button 
                  onClick={handleOvertimeConfirm}
                  disabled={!overtimeHours || parseFloat(overtimeHours) <= 0}
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftSelectionDialog;
