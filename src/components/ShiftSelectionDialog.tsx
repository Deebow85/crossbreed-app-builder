
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ShiftType, SwapType } from "@/types/calendar";
import { useState, useEffect } from "react";
import { Clock, ArrowLeftRight, UserRound } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [bulkHoursValue, setBulkHoursValue] = useState<string>("");
  const [applyMode, setApplyMode] = useState<"individual" | "same">("individual");
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
    // Reset swap details when shift type changes
    if (!selectedType?.isSwapOwed && !selectedType?.isSwapDone) {
      setShowSwapDetails(false);
    }
  }, [selectedType]);

  const handleShiftSelect = (shiftType: ShiftType | null) => {
    setSelectedType(shiftType);
    
    // If clearing the shift or selecting non-special shift and it's a single date selection, submit immediately
    if ((!shiftType || (!shiftType?.isOvertime && !shiftType?.isTOIL && 
        !shiftType?.isSwapDone && !shiftType?.isSwapOwed)) && selectedDates.length === 1) {
      onShiftSelect(shiftType, undefined);
      setOvertimeHours({});
      setSelectedType(null);
      return;
    }
    
    // For multi-selection or special shifts, we'll collect additional data before submitting
    if (shiftType?.isOvertime || shiftType?.isTOIL || 
        shiftType?.isSwapDone || shiftType?.isSwapOwed) {
      // Reset bulk hours when changing shift type
      setBulkHoursValue("");
      
      // If it's a swap type, we might want to show the swap details section
      if (shiftType?.isSwapOwed) {
        setSwapType("owed");
      } else if (shiftType?.isSwapDone) {
        setSwapType("payback");
      }
    }
  };

  const handleSubmit = () => {
    if (selectedType) {
      // For special shifts, validate that hours are set for all dates if needed
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

      // If it's a swap and swap details are shown, validate worker name
      if ((selectedType?.isSwapOwed || selectedType?.isSwapDone) && showSwapDetails) {
        if (!workerName.trim()) {
          toast({
            title: "Missing information",
            description: "Please enter the name of the worker",
            variant: "destructive"
          });
          return;
        }
        
        // Submit with swap details
        onShiftSelect(selectedType, overtimeHours, {
          workerName: workerName.trim(),
          type: swapType
        });
      } else {
        // Submit without swap details
        onShiftSelect(selectedType, overtimeHours);
      }
      
      // Reset state
      setOvertimeHours({});
      setSelectedType(null);
      setBulkHoursValue("");
      setShowSwapDetails(false);
      setWorkerName("");
    }
  };

  const needsHoursInput = selectedType?.isOvertime || selectedType?.isTOIL || 
                         selectedType?.isSwapDone || selectedType?.isSwapOwed;
  const showHoursInput = needsHoursInput && showOvertimeInput;
  const isSwapType = selectedType?.isSwapOwed || selectedType?.isSwapDone;

  const handleBulkHoursChange = (value: string) => {
    setBulkHoursValue(value);
    const numericValue = parseFloat(value);
    
    if (!isNaN(numericValue)) {
      // Apply the same hours to all selected dates
      const newOvertimeHours = { ...overtimeHours };
      selectedDates.forEach(date => {
        newOvertimeHours[date.toISOString()] = numericValue;
      });
      setOvertimeHours(newOvertimeHours);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setSelectedType(null);
          setOvertimeHours({});
          setBulkHoursValue("");
          setShowSwapDetails(false);
          setWorkerName("");
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

          {isSwapType && (
            <div className="mt-2">
              <Button
                variant="outline"
                onClick={() => setShowSwapDetails(!showSwapDetails)}
                className="w-full"
              >
                {showSwapDetails ? "Hide" : "Record shift swap"} <ArrowLeftRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {showSwapDetails && (
            <div className="space-y-3 border rounded-md p-3 bg-muted/20">
              <h3 className="font-medium text-sm">Shift swap details</h3>
              
              <div className="space-y-2">
                <label className="text-sm">Worker name:</label>
                <Input
                  placeholder="Enter coworker name"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm">Swap type:</label>
                <div className="flex space-x-2">
                  <Button
                    variant={swapType === "owed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSwapType("owed")}
                    className="flex-1"
                  >
                    <UserRound className="mr-1 h-4 w-4" /> Owed to you
                  </Button>
                  <Button
                    variant={swapType === "payback" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSwapType("payback")}
                    className="flex-1"
                  >
                    <ArrowLeftRight className="mr-1 h-4 w-4" /> You owe them
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showHoursInput && selectedDates.length > 1 && (
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
                    {selectedType?.isOvertime ? "Overtime" : 
                     selectedType?.isTOIL ? "TOIL" : 
                     selectedType?.isSwapDone ? "Swap (Done)" : 
                     selectedType?.isSwapOwed ? "Swap (Owed)" : ""} hours for all dates:
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

          {showHoursInput && (applyMode === "individual" || selectedDates.length === 1) && selectedDates.map(date => (
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
