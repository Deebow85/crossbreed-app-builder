import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarDays, Settings, Plus, Trash2, PencilIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShiftTypeSettings {
  name: string;
  color: string;
  gradient: string;
}

const ShiftSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shiftTypes, setShiftTypes] = useState<ShiftTypeSettings[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [colorMode, setColorMode] = useState<'solid' | 'gradient' | null>(null);
  const [startColor, setStartColor] = useState("#4B5563");
  const [endColor, setEndColor] = useState("#6B7280");
  const [isEditing, setIsEditing] = useState(false);

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
  };

  const updateShiftType = (index: number, field: keyof ShiftTypeSettings, value: string) => {
    const newShiftTypes = [...shiftTypes];
    newShiftTypes[index] = {
      ...newShiftTypes[index],
      [field]: value
    };
    saveShiftTypes(newShiftTypes);
  };

  const handleSolidColor = () => {
    setColorMode('solid');
    if (selectedIndex !== null) {
      setStartColor(shiftTypes[selectedIndex].color);
    }
  };

  const handleGradient = () => {
    setColorMode('gradient');
    if (selectedIndex !== null) {
      setStartColor(shiftTypes[selectedIndex].color);
      const endColorValue = shiftTypes[selectedIndex].gradient.match(/,(.*?)100%/)?.[1]?.trim() || shiftTypes[selectedIndex].color + "99";
      setEndColor(endColorValue);
    }
  };

  const handleColorConfirm = () => {
    if (selectedIndex === null) return;
    
    if (colorMode === 'solid') {
      updateShiftType(selectedIndex, 'color', startColor);
      updateShiftType(selectedIndex, 'gradient', `linear-gradient(135deg, ${startColor} 0%, ${startColor} 100%)`);
    } else if (colorMode === 'gradient') {
      updateShiftType(selectedIndex, 'color', startColor);
      updateShiftType(selectedIndex, 'gradient', `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`);
    }
    
    setIsDialogOpen(false);
    setColorMode(null);
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

  const handleDialogOpen = (index: number) => {
    setSelectedIndex(index);
    const currentType = shiftTypes[index];
    setStartColor(currentType.color);
    
    const endColorValue = currentType.gradient.match(/,(.*?)100%/)?.[1]?.trim() || currentType.color + "99";
    setEndColor(endColorValue);
    
    setIsDialogOpen(true);
    setColorMode(null);
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="h-dvh flex flex-col p-2 sm:p-4">
      <div className="flex justify-center items-center mb-2">
        <h1 className="text-xl font-bold">Shift Setup</h1>
      </div>

      <Card className="flex-1 overflow-auto mb-20">
        <div className="p-2 sm:p-4 space-y-3">
          <div className="flex justify-between items-center gap-2">
            <h2 className="text-lg font-semibold">Shift Types</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleEditing}
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                {isEditing ? "Done" : "Edit Types"}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={addShiftType}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Type
              </Button>
              {shiftTypes.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => removeShiftType(shiftTypes.length - 1)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove Type
                </Button>
              )}
            </div>
          </div>
          <div className="grid gap-1.5">
            {shiftTypes.map((type, index) => (
              <div key={index} className="flex gap-2 items-center p-1.5 border rounded-lg">
                <Input
                  value={type.name}
                  onChange={(e) => updateShiftType(index, 'name', e.target.value)}
                  className="w-24 h-7"
                  placeholder="Name"
                />
                <div 
                  className="w-14 h-7 rounded border"
                  style={{ background: type.gradient }}
                  onClick={() => isEditing && handleDialogOpen(index)}
                  role="button"
                  aria-label="Select color"
                />
                {isEditing && (
                  <Button
                    size="sm"
                    onClick={() => handleDialogOpen(index)}
                    variant="outline"
                    className="flex-1 h-7 text-xs"
                  >
                    Select Colour
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Colour Type</DialogTitle>
          </DialogHeader>
          {!colorMode ? (
            <div className="flex justify-center gap-4 pt-4">
              <Button onClick={handleSolidColor}>Solid Colour</Button>
              <Button onClick={handleGradient}>Gradient</Button>
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{colorMode === 'solid' ? 'Colour' : 'Start Colour'}</Label>
                <Input
                  type="color"
                  value={startColor}
                  onChange={(e) => setStartColor(e.target.value)}
                  className="w-full h-10"
                />
              </div>
              
              {colorMode === 'gradient' && (
                <div className="space-y-2">
                  <Label>End Colour</Label>
                  <Input
                    type="color"
                    value={endColor}
                    onChange={(e) => setEndColor(e.target.value)}
                    className="w-full h-10"
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setColorMode(null)}>Back</Button>
                <Button onClick={handleColorConfirm}>Confirm</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
