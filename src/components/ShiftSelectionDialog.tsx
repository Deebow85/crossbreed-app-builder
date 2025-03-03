
import React, { useState } from "react";
import { format } from "date-fns";
import { ShiftType } from "@/types/calendar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Box, StickyNote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ShiftSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDates: Date[];
  shiftTypes: ShiftType[];
  onShiftSelect: (selectedType: ShiftType | null, overtimeHours?: { [date: string]: number }) => void;
  showOvertimeInput?: boolean;
  initialShiftType?: ShiftType;
  initialOvertimeHours?: { [date: string]: number };
  onNoteClick?: () => void;
  hasNote?: boolean;
}

const ShiftSelectionDialog = ({
  open,
  onOpenChange,
  selectedDates,
  shiftTypes,
  onShiftSelect,
  showOvertimeInput = false,
  initialShiftType,
  initialOvertimeHours,
  onNoteClick,
  hasNote = false,
}: ShiftSelectionDialogProps) => {
  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType | null>(
    initialShiftType || null
  );
  const [overtimeHours, setOvertimeHours] = useState<{ [date: string]: number }>(
    initialOvertimeHours || {}
  );

  if (selectedDates.length === 0) return null;

  const handleOvertimeChange = (dateStr: string, hours: number) => {
    setOvertimeHours((prev) => ({
      ...prev,
      [dateStr]: hours,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {selectedDates.length === 1
              ? `Select for ${format(selectedDates[0], "MMMM d, yyyy")}`
              : `Select for ${selectedDates.length} dates`}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            {shiftTypes.map((type) => (
              <TooltipProvider key={type.name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={selectedShiftType?.name === type.name ? "default" : "outline"}
                      className={cn(
                        "h-16 flex flex-col items-center justify-center p-2",
                        selectedShiftType?.name === type.name && "ring-2 ring-primary"
                      )}
                      style={
                        selectedShiftType?.name === type.name
                          ? { background: type.gradient }
                          : {}
                      }
                      onClick={() => setSelectedShiftType(type)}
                    >
                      <Box className="h-5 w-5 mb-1" />
                      <span className="text-xs">{type.name}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{type.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={!selectedShiftType ? "default" : "outline"}
                    className={cn(
                      "h-16 flex flex-col items-center justify-center p-2 bg-gray-200 dark:bg-gray-800",
                      !selectedShiftType && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedShiftType(null)}
                  >
                    <Box className="h-5 w-5 mb-1" />
                    <span className="text-xs">Clear</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear shift</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {showOvertimeInput &&
            selectedShiftType?.isOvertime &&
            selectedDates.length === 1 && (
              <div className="space-y-2">
                <Label htmlFor="overtime-hours">Overtime Hours</Label>
                <Input
                  id="overtime-hours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={
                    overtimeHours[selectedDates[0].toISOString()] || ""
                  }
                  onChange={(e) =>
                    handleOvertimeChange(
                      selectedDates[0].toISOString(),
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="Enter overtime hours"
                />
              </div>
            )}

          {/* Add Note Option */}
          {selectedDates.length === 1 && (
            <>
              <Separator />
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={onNoteClick}
              >
                <StickyNote className="mr-2 h-4 w-4" />
                {hasNote ? "Edit Note" : "Add Note"}
              </Button>
            </>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                onShiftSelect(
                  selectedShiftType,
                  selectedShiftType?.isOvertime ? overtimeHours : undefined
                );
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftSelectionDialog;
