
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ShiftType } from "@/types/calendar";

type ShiftSelectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  shiftTypes: ShiftType[];
  onShiftSelect: (type: ShiftType | null) => void;
};

const ShiftSelectionDialog = ({
  open,
  onOpenChange,
  selectedDate,
  shiftTypes,
  onShiftSelect,
}: ShiftSelectionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Shift</DialogTitle>
          <DialogDescription>
            {selectedDate && `Select shift type for ${format(selectedDate, 'MMMM d, yyyy')}`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {shiftTypes.map((type) => (
            <Button
              key={type.name}
              onClick={() => onShiftSelect(type)}
              className="w-full justify-start"
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
