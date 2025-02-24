
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <div key={type.name} className="space-y-2">
              <Button
                onClick={() => {
                  if (type.isOvertime) {
                    const hours = window.prompt('Enter overtime hours:');
                    if (hours !== null) {
                      const parsedHours = parseFloat(hours);
                      if (!isNaN(parsedHours) && parsedHours > 0) {
                        onShiftSelect(type, parsedHours);
                      }
                    }
                  } else {
                    onShiftSelect(type);
                  }
                }}
                className="w-full justify-start"
                style={{
                  background: type.gradient,
                  color: 'white'
                }}
              >
                {type.name}
                {type.isOvertime && " (Overtime)"}
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => onShiftSelect(null)}
            className="w-full justify-start"
          >
            Remove Shift
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftSelectionDialog;
