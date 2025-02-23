import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarDays, Settings, Plus, Trash2, PencilIcon, Check, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface ShiftTypeSettings {
  name: string;
  symbol: string;
  color: string;
  gradient: string;
  isNew?: boolean;
}

interface ShiftPattern {
  shiftType: ShiftTypeSettings | null;
  days: number;
  isOff?: boolean;
}

interface PatternCycle {
  sequences: ShiftPattern[];
  repeatTimes: number;
  daysOffAfter: number;
}

const ShiftSetup = () => {
  const navigate = useNavigate();
  const [shiftTypes, setShiftTypes] = useState<ShiftTypeSettings[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [colorMode, setColorMode] = useState<'solid' | 'gradient' | null>(null);
  const [startColor, setStartColor] = useState("#4B5563");
  const [endColor, setEndColor] = useState("#6B7280");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedToRemove, setSelectedToRemove] = useState<number[]>([]);
  const [showPatternDialog, setShowPatternDialog] = useState(false);
  const [patternStartDate, setPatternStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [currentPattern, setCurrentPattern] = useState<ShiftPattern[]>([]);
  const [repeatTimes, setRepeatTimes] = useState(1);
  const [daysOffAfter, setDaysOffAfter] = useState(0);
  const [yearsToGenerate, setYearsToGenerate] = useState(1);

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

  const addToPattern = () => {
    setCurrentPattern([...currentPattern, { shiftType: null, days: 1, isOff: true }]);
  };

  const updatePattern = (index: number, field: keyof ShiftPattern, value: any) => {
    const newPattern = [...currentPattern];
    if (field === 'shiftType') {
      newPattern[index] = {
        ...newPattern[index],
        shiftType: value,
        isOff: value === null
      };
    } else {
      newPattern[index] = { ...newPattern[index], [field]: value };
    }
    setCurrentPattern(newPattern);
  };

  const removeFromPattern = (index: number) => {
    setCurrentPattern(currentPattern.filter((_, i) => i !== index));
  };

  const generateShifts = () => {
    if (currentPattern.length === 0) {
      alert('Please add at least one step to your pattern');
      return;
    }

    const startDate = new Date(patternStartDate + 'T00:00:00');
    if (isNaN(startDate.getTime())) {
      alert('Please select a valid start date');
      return;
    }
    
    const pattern: PatternCycle = {
      sequences: currentPattern.map(p => ({
        shiftType: p.shiftType,
        days: p.days,
        isOff: p.isOff
      })),
      repeatTimes,
      daysOffAfter
    };
    
    console.log('Generating pattern:', pattern);
    console.log('Start date:', startDate.toISOString());
    
    sessionStorage.setItem('patternData', JSON.stringify({
      pattern,
      startDate: startDate.toISOString().split('T')[0],
      years: yearsToGenerate
    }));
    
    setShowPatternDialog(false);
    navigate('/');
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
                onClick={() => setShowPatternDialog(true)}
              >
                <Wand2 className="h-3 w-3 mr-1" />
                Generate
              </Button>
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
                    <span className="text-base flex-1">
                      {type.name} ({type.symbol})
                    </span>
                    <Input
                      value={type.symbol}
                      readOnly
                      className="h-9 w-16 text-center text-lg font-semibold mx-auto"
                    />
                    <div 
                      className="w-32 h-9 rounded border flex-1"
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
                      className="h-9 text-base flex-1"
                      placeholder="Name"
                    />
                    <Input
                      value={type.symbol}
                      onChange={(e) => {
                        updateShiftType(index, 'symbol', e.target.value.toUpperCase());
                      }}
                      className="h-9 w-16 text-center text-lg font-semibold uppercase mx-auto"
                      placeholder=""
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <div 
                        className="w-32 h-9 rounded border"
                        style={{ background: type.gradient }}
                        onClick={() => isEditing && handleDialogOpen(index)}
                        role="button"
                        aria-label="Select color"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleDialogOpen(index)}
                        variant="outline"
                        className="h-9 px-2 text-xs whitespace-nowrap"
                      >
                        Select Colour
                      </Button>
                    </div>
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

      <Dialog open={showPatternDialog} onOpenChange={setShowPatternDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate Shift Pattern</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={patternStartDate}
                onChange={(e) => setPatternStartDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Pattern Sequence</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={addToPattern}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Step
                </Button>
              </div>
              
              {currentPattern.map((step, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={step.isOff ? "off" : (step.shiftType?.name || "")}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "off") {
                        updatePattern(index, 'shiftType', null);
                      } else {
                        const selectedType = shiftTypes.find(t => t.name === value);
                        updatePattern(index, 'shiftType', selectedType || null);
                      }
                    }}
                  >
                    <option value="off">Days Off</option>
                    {shiftTypes.map((type) => (
                      <option key={type.name} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  
                  <Input
                    type="number"
                    min="1"
                    value={step.days}
                    onChange={(e) => updatePattern(index, 'days', parseInt(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromPattern(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Repeat Pattern</Label>
                <Input
                  type="number"
                  min="1"
                  value={repeatTimes}
                  onChange={(e) => setRepeatTimes(parseInt(e.target.value))}
                />
                <span className="text-sm text-muted-foreground">times</span>
              </div>
              
              <div className="space-y-2">
                <Label>Days Off After Cycle</Label>
                <Input
                  type="number"
                  min="0"
                  value={daysOffAfter}
                  onChange={(e) => setDaysOffAfter(parseInt(e.target.value))}
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Generate Pattern For</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={yearsToGenerate}
                onChange={(e) => setYearsToGenerate(Math.min(Math.max(parseInt(e.target.value) || 0, 0), 10))}
              />
              <span className="text-sm text-muted-foreground">years (0-10)</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={generateShifts}>Generate Pattern</Button>
          </DialogFooter>
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
