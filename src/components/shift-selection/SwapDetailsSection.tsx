
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ShiftType, SwapType } from "@/types/calendar";
import { ArrowLeftRight, UserRound, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface SwapDetailsSectionProps {
  selectedType: ShiftType | null;
  showSwapDetails: boolean;
  setShowSwapDetails: (show: boolean) => void;
  workerName: string;
  setWorkerName: (name: string) => void;
  swapType: SwapType;
  setSwapType: (type: SwapType) => void;
  onOpenChange: (open: boolean) => void;
}

export function SwapDetailsSection({
  selectedType,
  showSwapDetails,
  setShowSwapDetails,
  workerName,
  setWorkerName,
  swapType,
  setSwapType,
  onOpenChange,
}: SwapDetailsSectionProps) {
  const navigate = useNavigate();
  const [showSwapPopover, setShowSwapPopover] = useState(false);
  
  const isSwapType = selectedType?.isSwapOwed || selectedType?.isSwapDone;
  
  if (!isSwapType) return null;

  const handleGoToNotesTracking = () => {
    onOpenChange(false);
    navigate("/notes-tracking");
  };

  return (
    <div className="space-y-3">
      <div className="mt-2">
        <Popover open={showSwapPopover} onOpenChange={setShowSwapPopover}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowSwapPopover(true)}
            >
              Record shift swap <ArrowLeftRight className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-3">
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

              <Button 
                onClick={() => {
                  if (!workerName.trim()) {
                    toast({
                      title: "Missing information",
                      description: "Please enter the name of the worker",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  setShowSwapDetails(true);
                  setShowSwapPopover(false);
                  
                  toast({
                    title: "Swap details saved",
                    description: `Swap with ${workerName} recorded. Complete by setting hours and submitting.`,
                  });
                }}
                className="w-full mt-3"
              >
                Save details
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="mt-2">
        <Button
          variant="outline"
          onClick={handleGoToNotesTracking}
          className="w-full"
        >
          View all shift swaps <FileText className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {showSwapDetails && (
        <div className="space-y-3 border rounded-md p-3 bg-muted/20">
          <h3 className="font-medium text-sm">Current shift swap details</h3>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Worker: <strong>{workerName || "Not specified"}</strong></span>
            <span className="text-sm">Type: <strong>{swapType === "owed" ? "Owed to you" : "You owe them"}</strong></span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSwapPopover(true)}
            className="w-full text-xs"
          >
            Edit details
          </Button>
        </div>
      )}
    </div>
  );
}
