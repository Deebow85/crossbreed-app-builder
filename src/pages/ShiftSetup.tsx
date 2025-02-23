import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarDays, Settings, Plus, Trash2, PencilIcon, Check } from "lucide-react";
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
  symbol: string;
  color: string;
  gradient: string;
  isNew?: boolean;
}

const ShiftSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shiftTypes, setShiftTypes] = useState<ShiftTypeSettings[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [colorMode, setColorMode] = useState<'solid' | 'gradient' | null>(null);
  const [startColor, setStartColor] = useState("#4B5563");
  const [endColor, setEndColor] = useState("#6B7280");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedToRemove, setSelectedToRemove] = useState<number[]>([]);

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
    const typesToSave = newShiftTypes.map(({ isNew, ...rest }) => rest);
    setShiftTypes(newShiftTypes);
    const savedSettings = localStorage.getItem('appSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.shiftTypes = typesToSave;
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
    
    const newShiftTypes = [...shiftTypes];
    if (colorMode === 'solid') {
      newShiftTypes[selectedIndex] = {
        ...newShiftTypes[selectedIndex],
        color: startColor,
        gradient: `linear-gradient(135deg, ${startColor} 0%, ${startColor} 100%)`,
        isNew: false
      };
    } else if (colorMode === 'gradient') {
      newShiftTypes[selectedIndex] = {
        ...newShiftTypes[selectedIndex],
        color: startColor,
        gradient: `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`,
        isNew: false
      };
    }
    
    saveShiftTypes(newShiftTypes);
    setIsDialogOpen(false);
    setColorMode(null);
  };

  const addShiftType = () => {
    const newShiftType: ShiftTypeSettings = {
      name: "New Shift",
      symbol: "",
      color: "#4B5563",
      gradient: "linear-gradient(135deg, #4B5563 0%, #6B7280 100%)",
      isNew: true
    };
    saveShiftTypes([...shiftTypes, newShiftType]);
  };

  const removeShiftType = (index: number) => {
    const newShiftTypes = shiftTypes.filter((_, i) => i !== index);
    saveShiftTypes(newShiftTypes);
    setIsRemoveDialogOpen(false);
    toast({
      title: "Shift type removed",
      description: `${shiftTypes[index].name} has been removed.`,
    });
  };

  const toggleShiftToRemove = (index: number) => {
    setSelectedToRemove(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const removeSelectedShiftTypes = () => {
    const newShiftTypes = shiftTypes.filter((_, index) => !selectedToRemove.includes(index));
    saveShiftTypes(newShiftTypes);
    setIsRemoveDialogOpen(false);
    setSelectedToRemove([]);
    toast({
      title: "Shift types removed",
      description: `${selectedToRemove.length} shift type(s) have been removed.`,
    });
  };

  const handleRemoveDialogOpen = () => {
    setSelectedToRemove([]);
    setIsRemoveDialogOpen(true);
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
          <div className="flex justify-between items-center gap-1">
            <h2 className="text-lg font-semibold">Shift Types</h2>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={toggleEditing}
              >
                <PencilIcon className="h-3 w-3" />
                {isEditing ? "Done" : "Edit"}
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={addShiftType}
              >
                <Plus className="h-3 w-3" />
                Add
              </Button>
              {shiftTypes.length > 0 && (
                <Button 
                  variant="destructive"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={handleRemoveDialogOpen}
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </Button>
              )}
            </div>
          </div>
          <div className="grid gap-1.5">
            {shiftTypes.map((type, index) => (
              <div key={index} className="flex items-center gap-2 p-1.5 border rounded-lg">
                {!type.isNew && !isEditing ? (
                  <>
                    <span className="text-base min-w-24">
                      {type.name} ({type.symbol})
                    </span>
                    <Input
                      value={type.symbol}
                      readOnly
                      className="h-9 w-16 text-center text-lg font-semibold"
                    />
                    <div 
                      className="w-20 h-9 rounded border"
                      style={{ background: type.gradient }}
                      role="button"
                      aria-label="Shift color"
                    />
                  </>
                ) : (
                  <>
                    <Input
                      value={type.name}
                      onChange={(e) => updateShiftType(index, 'name', e.target.value)}
                      className="w-28 h-9 text-base"
                      placeholder="Name"
                    />
                    <Input
                      value={type.symbol}
                      onChange={(e) => {
                        updateShiftType(index, 'symbol', e.target.value.toUpperCase());
                      }}
                      className="w-16 h-9 text-center text-lg font-semibold uppercase"
                      placeholder=""
                    />
                    <div 
                      className="w-20 h-9 rounded border"
                      style={{ background: type.gradient }}
                      onClick={() => isEditing && handleDialogOpen(index)}
                      role="button"
                      aria-label="Select color"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleDialogOpen(index)}
                      variant="outline"
                      className="h-9 px-2 text-xs"
                    >
                      Select Colour
                    </Button>
                  </>
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

      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Shift Types</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {shiftTypes.map((type, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer ${
                  selectedToRemove.includes(index) ? 'border-destructive bg-destructive/10' : ''
                }`}
                onClick={() => toggleShiftToRemove(index)}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded border flex items-center justify-center font-semibold"
                    style={{ background: type.gradient }}
                  >
                    {type.symbol}
                  </div>
                  <span>{type.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedToRemove.includes(index) && (
                    <Check className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
            ))}
            {selectedToRemove.length > 0 && (
              <Button
                variant="destructive"
                onClick={removeSelectedShiftTypes}
                className="mt-2"
              >
                Remove Selected ({selectedToRemove.length})
              </Button>
            )}
          </div>
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
