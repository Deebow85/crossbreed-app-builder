
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ShiftType, SwapType } from "@/types/calendar";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ShiftTypeSelector } from "./ShiftTypeSelector";
import { HoursInputSection } from "./HoursInputSection";
import { SwapDetailsSection } from "./SwapDetailsSection";
import { DialogActions } from "./DialogActions";

interface ShiftSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDates: Date[];
  shiftTypes: ShiftType[];
  onShiftSelect: (selectedType: ShiftType | null, overtimeHours?: { [date: string]: number }, swapDetails?: { workerName: string, type: SwapType }) => void;
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
  const [showSwapDetails, setShowSwapDetails] = useState<boolean>(false);
  const [workerName, setWorkerName] = useState<string>("");
  const [swapType, setSwapType] = useState<SwapType>("owed");

  useEffect(() => {
    if (open && initialShiftType) {
      setSelectedType(initialShiftType);
      setOvertimeHours(initialOvertimeHours || {});
    }
  }, [open, initialShiftType, initialOvertimeHours]);

  useEffect(() => {
    if (!selectedType?.isSwapOwed && !selectedType?.isSwapDone) {
      setShowSwapDetails(false);
    }
  }, [selectedType]);

  const handleShiftSelect = (shiftType: ShiftType | null) => {
    setSelectedType(shiftType);
    
    if ((!shiftType || (!shiftType?.isOvertime && !shiftType?.isTOIL && 
        !shiftType?.isSwapDone && !shiftType?.isSwapOwed)) && selectedDates.length === 1) {
      onShiftSelect(shiftType, undefined);
      setOvertimeHours({});
      setSelectedType(null);
      return;
    }
    
    if (shiftType?.isOvertime || shiftType?.isTOIL || 
        shiftType?.isSwapDone || shiftType?.isSwapOwed) {
      
      if (shiftType?.isSwapOwed) {
        setSwapType("owed");
        setShowSwapDetails(true);
      } else if (shiftType?.isSwapDone) {
        setSwapType("payback");
        setShowSwapDetails(true);
      }
    }
  };

  const handleResetState = () => {
    setSelectedType(null);
    setOvertimeHours({});
    setShowSwapDetails(false);
    setWorkerName("");
  };

  // Generate a descriptive title based on the selected shift type
  const getDialogTitle = () => {
    if (selectedType?.isOvertime) return "Edit overtime hours";
    if (selectedType?.isTOIL) return "Edit TOIL hours";
    if (selectedType?.isSwapDone || selectedType?.isSwapOwed) return "Edit swap hours";
    return "Set shift";
  };

  // Generate a descriptive subtitle
  const getDialogDescription = () => {
    let base = "Select a shift type";
    if (selectedType?.isOvertime) return `${base} and enter overtime hours`;
    if (selectedType?.isTOIL) return `${base} and enter TOIL hours`;
    if (selectedType?.isSwapDone) return `${base} and enter swap hours (done)`;
    if (selectedType?.isSwapOwed) return `${base} and enter swap hours (owed)`;
    return base;
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleResetState();
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {getDialogTitle()} for {selectedDates.length === 1 
              ? format(selectedDates[0], 'MMM do, yyyy')
              : `${selectedDates.length} selected dates`}
          </DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <ShiftTypeSelector 
            shiftTypes={shiftTypes}
            selectedType={selectedType}
            onShiftSelect={handleShiftSelect}
          />

          <SwapDetailsSection 
            selectedType={selectedType}
            showSwapDetails={showSwapDetails}
            setShowSwapDetails={setShowSwapDetails}
            workerName={workerName}
            setWorkerName={setWorkerName}
            swapType={swapType}
            setSwapType={setSwapType}
            onOpenChange={onOpenChange}
          />

          <HoursInputSection 
            selectedDates={selectedDates}
            selectedType={selectedType}
            overtimeHours={overtimeHours}
            setOvertimeHours={setOvertimeHours}
            showOvertimeInput={showOvertimeInput}
          />

          <DialogActions 
            selectedType={selectedType}
            initialShiftType={initialShiftType}
            showOvertimeInput={showOvertimeInput}
            selectedDates={selectedDates}
            overtimeHours={overtimeHours}
            showSwapDetails={showSwapDetails}
            workerName={workerName}
            swapType={swapType}
            onShiftSelect={onShiftSelect}
            handleShiftSelect={handleShiftSelect}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
