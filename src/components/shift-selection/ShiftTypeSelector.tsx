
import { Button } from "@/components/ui/button";
import { ShiftType } from "@/types/calendar";
import { Clock, ArrowLeftRight } from "lucide-react";

interface ShiftTypeSelectorProps {
  shiftTypes: ShiftType[];
  selectedType: ShiftType | null;
  onShiftSelect: (shiftType: ShiftType | null) => void;
}

export function ShiftTypeSelector({
  shiftTypes,
  selectedType,
  onShiftSelect,
}: ShiftTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {shiftTypes.map((type) => (
        <Button
          key={type.name}
          style={{
            background: type.gradient,
          }}
          variant={selectedType?.name === type.name ? "default" : "secondary"}
          onClick={() => onShiftSelect(type)}
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
  );
}
