
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/enhanced-dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Circle, Moon, Sun, StickyNote, Plus, Edit, Trash } from "lucide-react";
import { ShiftType } from "@/types/calendar";
import { useToast } from "@/hooks/use-toast";

interface ShiftSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onShiftSelect?: (shiftType: ShiftType) => void;
  hasNote?: boolean;
  onNoteClick?: () => void;
}

const ShiftSelectionDialog = ({
  isOpen,
  onClose,
  selectedDate,
  onShiftSelect,
  hasNote = false,
  onNoteClick
}: ShiftSelectionDialogProps) => {
  const { toast } = useToast();

  if (!selectedDate) return null;

  const handleShiftSelect = (shiftType: ShiftType) => {
    if (onShiftSelect) {
      onShiftSelect(shiftType);
    } else {
      toast({
        title: "Shift Selected",
        description: `Selected ${shiftType.name} for ${format(selectedDate, "MMMM d, yyyy")}`,
      });
    }
    onClose();
  };

  const sampleShiftTypes: ShiftType[] = [
    {
      name: "Day",
      color: "#4f46e5",
      gradient: "linear-gradient(45deg, #4f46e5, #818cf8)",
    },
    {
      name: "Night",
      color: "#1e3a8a",
      gradient: "linear-gradient(45deg, #1e3a8a, #3b82f6)",
    },
    {
      name: "Off",
      color: "#9ca3af",
      gradient: "linear-gradient(45deg, #9ca3af, #d1d5db)",
    },
  ];

  const formattedDate = format(selectedDate, "MMMM d, yyyy");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select option for {formattedDate}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Shift Types</h3>
            <div className="grid grid-cols-2 gap-2">
              {sampleShiftTypes.map((shiftType) => (
                <Button
                  key={shiftType.name}
                  className="justify-start"
                  variant="outline"
                  onClick={() => handleShiftSelect(shiftType)}
                >
                  {shiftType.name === "Day" && <Sun className="mr-2 h-4 w-4" />}
                  {shiftType.name === "Night" && <Moon className="mr-2 h-4 w-4" />}
                  {shiftType.name === "Off" && <Circle className="mr-2 h-4 w-4" />}
                  {shiftType.name}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Notes</h3>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={onNoteClick}
            >
              <StickyNote className="mr-2 h-4 w-4" />
              {hasNote ? "Edit Note" : "Add Note"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftSelectionDialog;
