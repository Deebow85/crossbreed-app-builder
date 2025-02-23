
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarDays, Settings, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface ShiftTypeSettings {
  name: string;
  color: string;
  gradient: string;
}

const defaultShiftTypes: ShiftTypeSettings[] = [
  {
    name: "Day",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #9F75FF 100%)"
  },
  {
    name: "Night",
    color: "#0EA5E9",
    gradient: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)"
  },
  {
    name: "OT",
    color: "#F97316",
    gradient: "linear-gradient(135deg, #F97316 0%, #FB923C 100%)"
  }
];

const ShiftSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shiftTypes, setShiftTypes] = useState<ShiftTypeSettings[]>(defaultShiftTypes);

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.shiftTypes) {
        setShiftTypes(settings.shiftTypes);
      }
    }
  }, []);

  const saveShiftTypes = (newShiftTypes: ShiftTypeSettings[]) => {
    setShiftTypes(newShiftTypes);
    const savedSettings = localStorage.getItem('appSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.shiftTypes = newShiftTypes;
    localStorage.setItem('appSettings', JSON.stringify(settings));
    toast({
      title: "Shift types saved",
      description: "Your shift types have been updated.",
    });
  };

  const updateShiftType = (index: number, field: keyof ShiftTypeSettings, value: string) => {
    const newShiftTypes = [...shiftTypes];
    newShiftTypes[index] = {
      ...newShiftTypes[index],
      [field]: value
    };
    saveShiftTypes(newShiftTypes);
  };

  const addShiftType = () => {
    const newShiftType: ShiftTypeSettings = {
      name: "New Shift",
      color: "#4B5563",
      gradient: "linear-gradient(135deg, #4B5563 0%, #6B7280 100%)"
    };
    saveShiftTypes([...shiftTypes, newShiftType]);
  };

  const removeShiftType = (index: number) => {
    const newShiftTypes = shiftTypes.filter((_, i) => i !== index);
    saveShiftTypes(newShiftTypes);
  };

  return (
    <div className="h-dvh flex flex-col p-2 sm:p-4">
      <div className="flex justify-center items-center mb-2">
        <h1 className="text-xl font-bold">Shift Setup</h1>
      </div>

      <Card className="flex-1 overflow-auto mb-20">
        <div className="p-2 sm:p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Shift Types</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={addShiftType}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Type
            </Button>
          </div>
          <div className="grid gap-1.5">
            {shiftTypes.map((type, index) => (
              <div key={index} className="flex gap-2 items-center p-1.5 border rounded-lg">
                <Input
                  value={type.name}
                  onChange={(e) => updateShiftType(index, 'name', e.target.value)}
                  className="w-20 h-7"
                  placeholder="Name"
                />
                <Input
                  type="color"
                  value={type.color}
                  onChange={(e) => updateShiftType(index, 'color', e.target.value)}
                  className="w-14 h-7"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    const color = type.color;
                    const gradient = `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`;
                    updateShiftType(index, 'gradient', gradient);
                  }}
                  variant="outline"
                  className="flex-1 h-7 text-xs"
                >
                  Generate Gradient
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7"
                  onClick={() => removeShiftType(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t py-4">
        <div className="container max-w-md mx-auto flex items-center justify-between px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-accent"
            onClick={() => navigate("/")}
          >
            <CalendarDays className="h-8 w-8" />
          </Button>
          
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-semibold text-xl">S</span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-accent"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShiftSetup;
