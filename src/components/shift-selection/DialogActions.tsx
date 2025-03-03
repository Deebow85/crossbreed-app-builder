
import { Button } from "@/components/ui/button";
import { ShiftType, SwapType } from "@/types/calendar";
import { toast } from "@/hooks/use-toast";

interface DialogActionsProps {
  selectedType: ShiftType | null;
  initialShiftType: ShiftType | undefined;
  showOvertimeInput: boolean;
  selectedDates: Date[];
  overtimeHours: { [date: string]: number };
  showSwapDetails: boolean;
  workerName: string;
  swapType: SwapType;
  onShiftSelect: (
    selectedType: ShiftType | null, 
    overtimeHours?: { [date: string]: number }, 
    swapDetails?: { workerName: string, type: SwapType }
  ) => void;
  handleShiftSelect: (shiftType: ShiftType | null) => void;
}

export function DialogActions({
  selectedType,
  initialShiftType,
  showOvertimeInput,
  selectedDates,
  overtimeHours,
  showSwapDetails,
  workerName,
  swapType,
  onShiftSelect,
  handleShiftSelect
}: DialogActionsProps) {
  const handleSubmit = () => {
    if (selectedType) {
      const needsHoursInput = selectedType?.isOvertime || selectedType?.isTOIL || 
                             selectedType?.isSwapDone || selectedType?.isSwapOwed;
      
      if (needsHoursInput && showOvertimeInput) {
        const missingHours = selectedDates.some(date => 
          !overtimeHours[date.toISOString()] && overtimeHours[date.toISOString()] !== 0
        );
        
        if (missingHours) {
          toast({
            title: "Missing hours",
            description: "Please enter hours for all selected dates",
            variant: "destructive"
          });
          return;
        }
      }

      if ((selectedType?.isSwapOwed || selectedType?.isSwapDone) && !showSwapDetails) {
        toast({
          title: "Missing information",
          description: "Please record shift swap details first",
          variant: "destructive"
        });
        return;
      }
      
      if ((selectedType?.isSwapOwed || selectedType?.isSwapDone) && showSwapDetails) {
        if (!workerName.trim()) {
          toast({
            title: "Missing information",
            description: "Please enter the name of the worker",
            variant: "destructive"
          });
          return;
        }
        
        onShiftSelect(selectedType, overtimeHours, {
          workerName: workerName.trim(),
          type: swapType
        });
      } else {
        onShiftSelect(selectedType, overtimeHours);
      }
    }
  };

  const needsHoursInput = selectedType?.isOvertime || selectedType?.isTOIL || 
                         selectedType?.isSwapDone || selectedType?.isSwapOwed;
  const showHoursInput = needsHoursInput && showOvertimeInput;

  return (
    <>
      {showHoursInput && (
        <Button onClick={handleSubmit} className="mt-2">
          {initialShiftType ? "Update" : "Set"} Hours
        </Button>
      )}

      {!showHoursInput && selectedType && (
        <Button onClick={handleSubmit} className="mt-2">
          {initialShiftType ? "Update" : "Set"} Shift
        </Button>
      )}

      <Button
        variant="outline"
        onClick={() => handleShiftSelect(null)}
        className="mt-2"
      >
        Clear Shift
      </Button>
    </>
  );
}
